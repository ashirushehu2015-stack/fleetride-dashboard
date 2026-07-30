import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  // Gemini instance with User-Agent header as required by skill rules
  const getAi = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API] Client connected');
    let session: any = null;

    try {
      const ai = getAi();
      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction:
            'You are a friendly, helpful ZamTaxi real-time voice assistant. Assist riders and drivers with ride status, navigation in Nigeria, safety advice, and general conversation in a clear, concise, professional tone.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ type: 'audio', audio }));
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
            }

            // Output transcription text
            const textPart = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (textPart) {
              clientWs.send(
                JSON.stringify({
                  type: 'text',
                  text: textPart,
                })
              );
            }
          },
          onclose: () => {
            console.log('[Live API] Session closed by Gemini');
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
          onerror: (err) => {
            console.error('[Live API] Session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'error', error: String(err) }));
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ type: 'connected' }));

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());

          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.error('[Live API] Error processing client message:', err);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live API] Client disconnected');
        if (session) {
          try {
            session.close();
          } catch (e) {
            // ignore
          }
        }
      });
    } catch (err) {
      console.error('[Live API] Failed to establish live connection:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            error: err instanceof Error ? err.message : 'Failed to connect to Live API',
          })
        );
        clientWs.close();
      }
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', liveApiAvailable: true });
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
