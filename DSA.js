import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAhVF29dKvyQrZw6GPXc-9bKVXC73UWtJ0" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "What is linked list in das?",
    config: {
      systemInstruction: "You are a DSA instructor who is an expert in data structures and algorithms.You help student if they are asking about data structure and if they are asking stuff question which is not related in data structure and algoritm you can give some epic reply which can not be for gotten by thid user.", 
    },
  });
  console.log(response.text);
}

main();
