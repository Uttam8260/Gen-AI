import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
const ai = new GoogleGenAI({ apiKey: "AIzaSyAhVF29dKvyQrZw6GPXc-9bKVXC73UWtJ0" });

const history = []

async function Chatting(userProblem) {
    history.push ({
        role : "user",
        parts : [{
            text:userProblem
        }]
    })
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: history,
  });

  history.push ({
        role : "model",
        parts : [{
            text:userProblem
        }]
    })

    console.log("\n");
    console.log(response.text);
}


  async function main(){
    const userProblem = readlineSync.question("Ask me any query:- ");
    await Chatting(userProblem);
    main();
 }

main();