import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// Get the directory name to correctly locate index.html
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve the static files (our index.html) from the main directory
app.use(express.static(path.join(__dirname)));

// This is our new API endpoint that the browser will call
app.post('/api/claude', async (req, res) => {
  // Your API key is now securely read from the environment variables
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ 
      error: { message: "ANTHROPIC_API_KEY is not set on the server. Make sure you have a .env file and are using 'npm start'." } 
    });
  }

  try {
    // We forward the request from the browser to the real Anthropic API
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        system: req.body.system,
        messages: req.body.messages
    }, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY, // The key is added here, on the server
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });
    // Send the successful response from Claude back to the browser
    res.json(response.data);
  } catch (error) {
    // If something goes wrong, send a structured error back to the browser
    console.error('Error calling Anthropic API:', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.error.message : "An internal server error occurred.";
    res.status(status).json({ error: { message } });
  }
});

app.listen(port, () => {
  console.log(`✨ Claude Code Studio is running! Open your browser to http://localhost:${port}`);
});