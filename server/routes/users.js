import { Router } from 'express';
import { store } from '../store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { sendNotification, broadcastAll } from '../ws.js';

const router = Router();

// GET /api/users — search/list
router.get('/', optionalAuth, (req, res) => {
  const { q } = req.query;
  if (q) {
    const { users } = store.search(q);
    return res.json({ users: users.map(u => ({
      ...u,
      isFollowing: req.userId ? store.isFollowing(req.userId, u.id) : false,
    }))});
  }
  const suggestions = store.getSuggestions(req.userId || 'none');
  return res.json({ users: suggestions });
});

// GET /api/users/suggestions
router.get('/suggestions', requireAuth, (req, res) => {
  const suggestions = store.getSuggestions(req.userId);
  return res.json({ users: suggestions.map(u => ({
    ...u,
    isFollowing: store.isFollowing(req.userId, u.id),
  }))});
});

// GET /api/users/:id
router.get('/:id', optionalAuth, (req, res) => {
  const user = store.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safe = store.safeUser(user);
  return res.json({
    user: {
      ...safe,
      isFollowing: req.userId ? store.isFollowing(req.userId, user.id) : false,
    }
  });
});

// PUT /api/users/:id — update profile
router.put('/:id', requireAuth, (req, res) => {
  if (req.params.id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const { displayName, bio, location, website, avatar, coverPhoto, privacy } = req.body;
  const updated = store.updateUser(req.userId, { displayName, bio, location, website, avatar, coverPhoto, privacy });
  return res.json({ user: store.safeUser(updated) });
});

// POST /api/users/:id/follow
router.post('/:id/follow', requireAuth, (req, res) => {
  if (req.params.id === req.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
  const result = store.toggleFollow(req.userId, req.params.id);
  if (!result) return res.status(404).json({ error: 'User not found' });

  if (result.following) {
    const notif = store.createNotification({
      userId: req.params.id,
      type: 'follow',
      actorId: req.userId,
      message: `${req.user.displayName} started following you`,
    });
    sendNotification(req.params.id, notif);
  }

  broadcastAll({ type: 'follow_update', followerId: req.userId, followedId: req.params.id, following: result.following });
  return res.json(result);
});

// POST /api/users/:id/friend-request
router.post('/:id/friend-request', requireAuth, (req, res) => {
  if (req.params.id === req.userId) return res.status(400).json({ error: 'Cannot friend yourself' });
  const request = store.sendFriendRequest(req.userId, req.params.id);
  const notif = store.createNotification({
    userId: req.params.id,
    type: 'friend_request',
    actorId: req.userId,
    message: `${req.user.displayName} sent you a friend request`,
  });
  sendNotification(req.params.id, notif);
  return res.json({ request });
});

// POST /api/friend-requests/:id/respond
router.post('/friend-requests/:id/respond', requireAuth, (req, res) => {
  const { action } = req.body; // 'accept' | 'decline'
  const result = store.respondFriendRequest(req.params.id, action);
  if (!result) return res.status(404).json({ error: 'Request not found' });
  if (action === 'accept') {
    const notif = store.createNotification({
      userId: result.fromId,
      type: 'friend_accepted',
      actorId: req.userId,
      message: `${req.user.displayName} accepted your friend request`,
    });
    sendNotification(result.fromId, notif);
  }
  return res.json({ request: result });
});

// GET /api/users/:id/posts
router.get('/:id/posts', optionalAuth, (req, res) => {
  const posts = store.getUserPosts(req.params.id);
  const enriched = posts.map(p => ({
    ...p,
    author: store.safeUser(store.getUser(p.authorId)),
    liked: req.userId ? store.hasLiked(req.userId, p.id) : false,
  }));
  return res.json({ posts: enriched });
});

export default router;
