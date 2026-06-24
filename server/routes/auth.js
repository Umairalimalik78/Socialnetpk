import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../store.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    if (store.getUserByEmail(email)) return res.status(400).json({ error: 'Email already in use' });
    if (store.getUserByUsername(username)) return res.status(400).json({ error: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = store.createUser({ username, displayName: displayName || username, email, password: passwordHash });
    user.passwordHash = passwordHash;
    const token = signToken(user.id);
    return res.status(201).json({ token, user: store.safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user.id);
    return res.json({ token, user: store.safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(auth.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  const user = store.getUser(payload.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json({ user: store.safeUser(user) });
});

export default router;
