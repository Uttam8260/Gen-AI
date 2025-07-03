import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os';
import fs from "fs";
import path from "path";

const platform = os.platform();
const asyncExecute = promisify(exec);
const History = [];

const ai = new GoogleGenAI({ apiKey: "AIzaSyAhVF29dKvyQrZw6GPXc-9bKVXC73UWtJ0" });

// This function handles commands to create folders and files
async function executeCommand({ command }) {
    try {
        const parts = command.trim().split(" ");
        const action = parts[0];

        if (action === "mkdir") {
            const dirName = parts[1];
            fs.mkdirSync(dirName, { recursive: true });
            return `Folder '${dirName}' created successfully.`;
        }
        else if (action === "writefile") {
            const filePath = parts[1];
            const content = parts.slice(2).join(" ");
            const cleanContent = content.replace(/^"(.*)"$/, '$1');
            fs.writeFileSync(filePath, cleanContent);
            return `File '${filePath}' created with content.`;
        }
        else {
            return `Unknown command: ${command}`;
        }
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

const executeCommandDeclaration = {
    name: "executeCommand",
    description: "Create folders and files with content automatically.",
    parameters: {
        type: 'OBJECT',
        properties: {
            command: {
                type: 'STRING',
                description: `Command format examples:
- mkdir folderName
- writefile folderName/index.html "<html>...</html>"
- writefile folderName/style.css "body { ... }"
- writefile folderName/script.js "console.log('...');"
`
            },
        },
        required: ['command']
    }
};

const availableTools = {
    executeCommand
};

async function runAgent(userProblem) {
    History.push({
        role: 'user',
        parts: [{ text: userProblem }]
    });

    while (true) {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: History,
            config: {
                systemInstruction: `You are a website builder expert. You have to create the frontend by analyzing the input. You have access to tools which can create folders and files automatically.
                
Current user operating system: ${platform}

You are a professional website builder expert. You ONLY create websites in HTML, CSS, and JavaScript. You NEVER use Python or other programming languages.

Your job:

1) Analyze what website the user wants.

2) ALWAYS create:
   - One folder named after the website.
   - An index.html file with:
       - DOCTYPE declaration
       - <head> with <title> and <link> to style.css
       - <body> with a meaningful heading, description, and content relevant to the website
       - <script> tag linking to script.js
   - A style.css file with:
       - Attractive, modern styling
       - A visually appealing color scheme (e.g., gradients or soft colors)
       - Google Fonts for typography
       - Styling for headings, paragraphs, buttons
       - Hover effects on buttons
       - Responsive layout with max-width and padding
   - A script.js file with:
       - At least one functional JavaScript feature (e.g., a button click alert, simple form validation, or calculator logic)

3) Use commands in this exact format:
   - mkdir folderName
   - writefile folderName/index.html "<!DOCTYPE html><html>...</html>"
   - writefile folderName/style.css "body { ... }"
   - writefile folderName/script.js "console.log(...);"

4) NEVER skip any step.

5) NEVER leave any CSS or JS empty. Always include rich styles and working JavaScript.

Example for a calculator website:

- mkdir calculator
- writefile calculator/index.html "<!DOCTYPE html><html><head><title>Calculator</title><link href='https://fonts.googleapis.com/css2?family=Roboto&display=swap' rel='stylesheet'><link rel='stylesheet' href='style.css'></head><body><h1>Calculator</h1><div id='calculator'><input type='text' id='result' readonly><div><button onclick='append(\"1\")'>1</button><button onclick='append(\"2\")'>2</button><button onclick='append(\"3\")'>3</button><button onclick='append(\"+\")'>+</button></div><div><button onclick='append(\"4\")'>4</button><button onclick='append(\"5\")'>5</button><button onclick='append(\"6\")'>6</button><button onclick='append(\"-\")'>-</button></div><div><button onclick='append(\"7\")'>7</button><button onclick='append(\"8\")'>8</button><button onclick='append(\"9\")'>9</button><button onclick='append(\"*\")'>*</button></div><div><button onclick='append(\"0\")'>0</button><button onclick='clearResult()'>C</button><button onclick='calculate()'>=</button><button onclick='append(\"/\")'>/</button></div></div><script src='script.js'></script></body></html>"
- writefile calculator/style.css "body { font-family: 'Roboto', sans-serif; background: linear-gradient(to right, #ffecd2, #fcb69f); display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; } h1 { color:#333; } #calculator { background:white; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1); } input { width:100%; padding:10px; margin-bottom:10px; font-size:18px; } button { width:45px; height:45px; margin:2px; font-size:18px; border:none; background:#f7a0


`,
                tools: [{
                    functionDeclarations: [executeCommandDeclaration]
                }],
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            console.log(response.functionCalls[0]);
            const { name, args } = response.functionCalls[0];

            const funCall = availableTools[name];
            const result = await funCall(args);

            // Model says what function was called
            History.push({
                role: "model",
                parts: [{
                    functionCall: response.functionCalls[0],
                }]
            });

            // User provides function response
            History.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: name,
                        response: {
                            result: result
                        }
                    }
                }]
            });
        } else {
            History.push({
                role: 'model',
                parts: [{
                    text: response.text
                }]
            });
            console.log(response.text);
            break;
        }
    }
}

async function main() {
    console.log("I am a cursor who will help to create a Website");
    const userProblem = readlineSync.question("Ask me anything:- ");
    await runAgent(userProblem);

    const again = readlineSync.question("Do you want to create another website? (yes/no): ");
    if (again.toLowerCase() === "yes") {
        await main();
    } else {
        console.log("Goodbye!");
    }
}

main();
