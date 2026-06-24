import { Router } from 'express';
import { store } from '../store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  const notifications = store.getUserNotifications(req.userId);
  const enriched = notifications.map(n => ({
    ...n,
    actor: n.actorId ? store.safeUser(store.getUser(n.actorId)) : null,
  }));
  const unreadCount = enriched.filter(n => !n.read).length;
  return res.json({ notifications: enriched, unreadCount });
});

// PUT /api/notifications/read — mark all as read
router.put('/read', requireAuth, (req, res) => {
  store.markNotificationsRead(req.userId);
  return res.json({ success: true });
});

// GET /api/notifications/friend-requests — pending requests
router.get('/friend-requests', requireAuth, (req, res) => {
  const requests = store.getPendingRequests(req.userId);
  const enriched = requests.map(r => ({
    ...r,
    from: store.safeUser(store.getUser(r.fromId)),
  }));
  return res.json({ requests: enriched });
});

export default router;
