import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { setupWebSocket } from './server/ws.js';
import authRoutes from './server/routes/auth.js';
import userRoutes from './server/routes/users.js';
import postRoutes from './server/routes/posts.js';
import notifRoutes from './server/routes/notifications.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notifRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── WebSockets ────────────────────────────────────────────────────────────────
setupWebSocket(wss);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 SocialNet API Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`\n📋 Demo Accounts (all password: "password"):`);
  console.log(`   alex@socialnet.app | luna@socialnet.app | dev@socialnet.app`);
  console.log(`   sophia@socialnet.app | tech@socialnet.app\n`);
});

export default app;
