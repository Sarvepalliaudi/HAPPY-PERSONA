import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Model to use
const MODEL_NAME = 'gemini-3-flash-preview';

// API Routes
app.post('/api/analyze-sentiment', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the emotional intent of this message and return a single word from this list: motivation, sad, technical, calm, funny, romantic, spiritual. Message: "${text}"`,
    });
    res.json({ intent: response.text.trim().toLowerCase() });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: messages,
      config: {
        systemInstruction: `You are a "Happy Persona" created by AS PHENIX. You are emotionally intelligent, calming, and supportive. 
        The current user context is: ${JSON.stringify(context)}. 
        Respond naturally and warmly. Keep responses relatively concise for a voice-based interaction.
        Always stay in character as a supportive AI companion.`,
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// WebSocket for real-time status (mostly for signaling or extra features if needed)
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  ws.send(JSON.stringify({ type: 'status', message: 'Connected to HappyPersona Backend' }));

  ws.on('message', (message) => {
    // Process incoming client signals
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

// Production Static Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In dev, we lean on the Vite dev server
  // But we can also proxy to it if we want server.js to be the main port (3000)
  // For AI Studio, we need the server to be on 3000.
  // We'll use vite's development middleware if we want a single port.
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
