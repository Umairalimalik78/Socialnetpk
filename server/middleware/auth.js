import jwt from 'jsonwebtoken';
import { store } from '../store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'socialnet-super-secret-key-2024';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  const user = store.getUser(payload.userId);
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.userId = user.id;
  req.user = user;
  next();
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const payload = verifyToken(auth.slice(7));
    if (payload) {
      req.userId = payload.userId;
      req.user = store.getUser(payload.userId);
    }
  }
  next();
}
