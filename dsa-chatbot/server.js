// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = 8080;

const genAI = new GoogleGenerativeAI("AIzaSyAhVF29dKvyQrZw6GPXc-9bKVXC73UWtJ0");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/ask", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are a DSA instructor who is an expert in data structures and algorithms. Give witty responses if the question is off-topic and if it is based on DSA give simply english which is understandable by user ",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${8080}`);
});
