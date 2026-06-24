import { Router } from 'express';
import { store } from '../store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { broadcastNewPost, sendNotification } from '../ws.js';

const router = Router();

// GET /api/posts — feed
router.get('/', optionalAuth, (req, res) => {
  const { before, limit = 20 } = req.query;
  const posts = store.getFeedPosts(req.userId, parseInt(limit), before);
  const enriched = posts.map(p => ({
    ...p,
    author: store.safeUser(store.getUser(p.authorId)),
    liked: req.userId ? store.hasLiked(req.userId, p.id) : false,
  }));
  return res.json({ posts: enriched });
});

// GET /api/posts/trending
router.get('/trending', (req, res) => {
  return res.json({ trending: store.getTrending() });
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  return res.json({
    post: {
      ...post,
      author: store.safeUser(store.getUser(post.authorId)),
      liked: req.userId ? store.hasLiked(req.userId, post.id) : false,
    }
  });
});

// POST /api/posts — create
router.post('/', requireAuth, (req, res) => {
  const { content, image, video, privacy } = req.body;
  if (!content && !image && !video) return res.status(400).json({ error: 'Post must have content' });
  const post = store.createPost({ authorId: req.userId, content, image, video, privacy });
  const enriched = { ...post, author: store.safeUser(req.user), liked: false };
  broadcastNewPost(enriched, req.user);
  return res.status(201).json({ post: enriched });
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  store.deletePost(req.params.id);
  return res.json({ success: true });
});

// POST /api/posts/:id/like
router.post('/:id/like', requireAuth, (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const result = store.toggleLike(req.userId, req.params.id);
  if (result.liked && post.authorId !== req.userId) {
    const notif = store.createNotification({
      userId: post.authorId,
      type: 'like',
      actorId: req.userId,
      postId: post.id,
      message: `${req.user.displayName} liked your post`,
    });
    sendNotification(post.authorId, notif);
  }
  return res.json(result);
});

// GET /api/posts/:id/comments
router.get('/:id/comments', optionalAuth, (req, res) => {
  const comments = store.getPostComments(req.params.id);
  const enriched = comments.map(c => ({
    ...c,
    author: store.safeUser(store.getUser(c.authorId)),
  }));
  return res.json({ comments: enriched });
});

// POST /api/posts/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });
  const comment = store.createComment({ postId: req.params.id, authorId: req.userId, content });
  const enriched = { ...comment, author: store.safeUser(req.user) };
  if (post.authorId !== req.userId) {
    const notif = store.createNotification({
      userId: post.authorId,
      type: 'comment',
      actorId: req.userId,
      postId: post.id,
      commentId: comment.id,
      message: `${req.user.displayName} commented on your post`,
    });
    sendNotification(post.authorId, notif);
  }
  return res.status(201).json({ comment: enriched, commentsCount: post.commentsCount });
});

export default router;
