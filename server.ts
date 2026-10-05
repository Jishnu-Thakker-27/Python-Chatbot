import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Chat API endpoint for the Aether Space Tactile Chatbot
app.post('/api/chat', async (req, res) => {
  const { message, username, history } = req.body;
  const displayName = username || 'Friend';

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (ai) {
      const systemInstruction = `You are Aether, an intelligent, empathetic, and mindful AI companion in the Aether Space tactile sound & mindfulness app. The user's name is ${displayName}. Keep your answers clear, warm, conversational, inspiring, and helpful. You excel at morning motivation, focus strategies, calm reflection, soundscape and spatial audio advice, creative problem solving, and day planning. Format with clean typography and friendly tone.`;

      // Build conversation contents
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        history.slice(-8).forEach((item: { role: string; content: string }) => {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || `Good morning, ${displayName}! It's wonderful to connect with you. How can I support your focus today?`;
      return res.json({ reply });
    }
  } catch (err) {
    console.error('Gemini API execution error:', err);
  }

  // Context-aware fallback response if API is unreachable
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `Good morning, ${displayName}! Ready to make today meaningful and calm. What would you like to explore or accomplish together?`;

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('morning')) {
    fallbackReply = `Good morning, ${displayName}! The air is fresh and the tactile mindscape is ready. How are you feeling as you step into your day?`;
  } else if (lowerMsg.includes('focus') || lowerMsg.includes('study') || lowerMsg.includes('work')) {
    fallbackReply = `Deep focus is all about setting a gentle boundary with distractions, ${displayName}. Would you like a 25-minute Pomodoro rhythm with binaural theta frequencies, or should we break down your key objective first?`;
  } else if (lowerMsg.includes('meditat') || lowerMsg.includes('breath') || lowerMsg.includes('calm') || lowerMsg.includes('anxious') || lowerMsg.includes('stress')) {
    fallbackReply = `Let's take a slow breath together, ${displayName}. Inhale deeply through your nose for 4 seconds, hold for 4, and softly release. Remember that every moment is a chance to reset. What's on your mind?`;
  } else if (lowerMsg.includes('music') || lowerMsg.includes('sound') || lowerMsg.includes('spatial')) {
    fallbackReply = `Spatial audio expands the sound field into a spherical 360° realm, reducing auditory fatigue. I recommend settling into 432Hz ambient harmonies or gentle rainfall when diving into creative work!`;
  } else {
    fallbackReply = `That's an interesting thought, ${displayName}. Let's dive deeper into it: what aspect is most important to you right now?`;
  }

  return res.json({ reply: fallbackReply });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
