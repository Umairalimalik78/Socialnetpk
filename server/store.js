import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ── Helper ──────────────────────────────────────────────────────────────────
function ts() { return new Date().toISOString(); }

// ── Seed Data ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'user-1',
    username: 'alex_nova',
    displayName: 'Alex Nova',
    email: 'alex@socialnet.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=alex`,
    coverPhoto: 'https://picsum.photos/seed/cover1/1200/400',
    bio: '✨ Building the future, one line at a time. Tech & Design enthusiast.',
    location: 'San Francisco, CA',
    website: 'https://alexnova.dev',
    followersCount: 9991,
    followingCount: 6664,
    privacy: 'public',
    createdAt: ts(),
    verified: true,
  },
  {
    id: 'user-2',
    username: 'luna_creative',
    displayName: 'Luna Creative',
    email: 'luna@socialnet.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=luna`,
    coverPhoto: 'https://picsum.photos/seed/cover2/1200/400',
    bio: '🎨 Designer & visual storyteller. Making pixels dance since 2015.',
    location: 'New York, NY',
    website: '',
    followersCount: 12450,
    followingCount: 890,
    privacy: 'public',
    createdAt: ts(),
    verified: true,
  },
  {
    id: 'user-3',
    username: 'devpulse',
    displayName: 'DevPulse',
    email: 'dev@socialnet.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=devpulse`,
    coverPhoto: 'https://picsum.photos/seed/cover3/1200/400',
    bio: '💻 Open source contributor. Coffee-powered coder. All things web.',
    location: 'Austin, TX',
    website: '',
    followersCount: 5230,
    followingCount: 1200,
    privacy: 'public',
    createdAt: ts(),
    verified: false,
  },
  {
    id: 'user-4',
    username: 'sophia_world',
    displayName: 'Sophia World',
    email: 'sophia@socialnet.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sophia`,
    coverPhoto: 'https://picsum.photos/seed/cover4/1200/400',
    bio: '🌍 Travel blogger & photographer. Capturing moments around the globe.',
    location: 'Paris, France',
    website: '',
    followersCount: 24100,
    followingCount: 430,
    privacy: 'public',
    createdAt: ts(),
    verified: true,
  },
  {
    id: 'user-5',
    username: 'techcurrent',
    displayName: 'Tech Current',
    email: 'tech@socialnet.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=techcurrent`,
    coverPhoto: 'https://picsum.photos/seed/cover5/1200/400',
    bio: '📰 Latest in tech, AI, and startups. Curating what matters.',
    location: 'Seattle, WA',
    website: '',
    followersCount: 87200,
    followingCount: 1100,
    privacy: 'public',
    createdAt: ts(),
    verified: true,
  },
];

const SEED_POSTS = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: 'Just shipped a brand new design system for our app! 🎨 Consistency is everything when building at scale. #Design #UIKit #ProductDesign',
    image: 'https://picsum.photos/seed/post1/800/450',
    video: null,
    privacy: 'public',
    likesCount: 241,
    commentsCount: 3,
    sharesCount: 45,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    hashtags: ['Design', 'UIKit', 'ProductDesign'],
  },
  {
    id: 'post-2',
    authorId: 'user-5',
    content: 'AI is now writing 30% of code at major tech companies. This is either the best or worst thing to happen to software engineering, depending on who you ask. Thoughts? #AI #TechNews #Software',
    image: null,
    video: null,
    privacy: 'public',
    likesCount: 892,
    commentsCount: 5,
    sharesCount: 234,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    hashtags: ['AI', 'TechNews', 'Software'],
  },
  {
    id: 'post-3',
    authorId: 'user-4',
    content: 'Sunrise in Santorini 🌅 There\'s nowhere else on earth quite like this. The light here is absolutely magical. #Travel #Santorini #Photography',
    image: 'https://picsum.photos/seed/santorini/800/500',
    video: null,
    privacy: 'public',
    likesCount: 3411,
    commentsCount: 2,
    sharesCount: 567,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hashtags: ['Travel', 'Santorini', 'Photography'],
  },
  {
    id: 'post-4',
    authorId: 'user-3',
    content: 'Hot take: The best documentation is the one developers actually read. Write it like you\'re explaining to a friend, not writing a legal contract. #OpenSource #DevTips #Coding',
    image: null,
    video: null,
    privacy: 'public',
    likesCount: 567,
    commentsCount: 4,
    sharesCount: 123,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hashtags: ['OpenSource', 'DevTips', 'Coding'],
  },
  {
    id: 'post-5',
    authorId: 'user-1',
    content: 'Working on something big. Can\'t share yet but it involves #WebSockets, real-time data, and a lot of caffeine ☕. Stay tuned! #BuildingInPublic #Tech',
    image: null,
    video: null,
    privacy: 'public',
    likesCount: 178,
    commentsCount: 2,
    sharesCount: 34,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    hashtags: ['WebSockets', 'BuildingInPublic', 'Tech'],
  },
];

const SEED_COMMENTS = [
  { id: 'cmt-1', postId: 'post-1', authorId: 'user-1', content: 'This is stunning! Love the consistency in spacing. What tools did you use?', likesCount: 12, createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
  { id: 'cmt-2', postId: 'post-1', authorId: 'user-3', content: 'Figma + custom tokens? Asking for a friend 👀', likesCount: 8, createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
  { id: 'cmt-3', postId: 'post-1', authorId: 'user-2', content: 'Yes! Figma variables + Storybook for the win 🙌', likesCount: 15, createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'cmt-4', postId: 'post-2', authorId: 'user-1', content: 'As someone who writes code for a living — I welcome our new AI overlords 🤖', likesCount: 234, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'cmt-5', postId: 'post-2', authorId: 'user-3', content: 'The real question is who reviews the AI\'s code? More AI? 😅', likesCount: 189, createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
  { id: 'cmt-6', postId: 'post-3', authorId: 'user-1', content: 'Absolutely breathtaking 😍 Adding this to my bucket list!', likesCount: 67, createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  { id: 'cmt-7', postId: 'post-4', authorId: 'user-2', content: 'Preach! Just spent 2 hours decoding a README that needed a PhD to understand.', likesCount: 45, createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString() },
  { id: 'cmt-8', postId: 'post-5', authorId: 'user-4', content: 'Can\'t wait to see what you\'re building! 👀', likesCount: 23, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
];

// ── Store ─────────────────────────────────────────────────────────────────────
export const store = {
  users: new Map(SEED_USERS.map(u => [u.id, { ...u }])),
  posts: new Map(SEED_POSTS.map(p => [p.id, { ...p }])),
  comments: new Map(SEED_COMMENTS.map(c => [c.id, { ...c }])),
  likes: new Map(),          // key: `${userId}:${postId}`
  commentLikes: new Map(),   // key: `${userId}:${commentId}`
  follows: new Map(),        // key: `${followerId}:${followedId}`
  friendRequests: new Map(), // key: id → { id, fromId, toId, status, createdAt }
  notifications: new Map(),  // key: id → notification object
  sessions: new Map(),       // token → userId

  // ── Users ──────────────────────────────────────────────────────────────────
  getUser(id) { return this.users.get(id); },
  getUserByEmail(email) {
    for (const u of this.users.values()) if (u.email === email) return u;
    return null;
  },
  getUserByUsername(username) {
    for (const u of this.users.values()) if (u.username === username) return u;
    return null;
  },
  createUser({ username, displayName, email, password }) {
    const id = `user-${uuidv4()}`;
    const passwordHash = password; // pre-hashed by route
    const user = {
      id, username, displayName, email, passwordHash,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      coverPhoto: `https://picsum.photos/seed/${username}/1200/400`,
      bio: '', location: '', website: '',
      followersCount: 0, followingCount: 0,
      privacy: 'public', verified: false, createdAt: ts(),
    };
    this.users.set(id, user);
    return user;
  },
  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  },
  safeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  },

  // ── Posts ──────────────────────────────────────────────────────────────────
  getPost(id) { return this.posts.get(id); },
  getFeedPosts(viewerId, limit = 20, before = null) {
    let posts = [...this.posts.values()]
      .filter(p => {
        if (p.privacy === 'public') return true;
        if (p.privacy === 'private') return p.authorId === viewerId;
        if (p.privacy === 'friends') {
          const key = `${viewerId}:${p.authorId}`;
          return p.authorId === viewerId || this.follows.has(key);
        }
        return false;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (before) posts = posts.filter(p => new Date(p.createdAt) < new Date(before));
    return posts.slice(0, limit);
  },
  getUserPosts(userId) {
    return [...this.posts.values()]
      .filter(p => p.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createPost({ authorId, content, image, video, privacy }) {
    const id = `post-${uuidv4()}`;
    const hashtags = (content.match(/#(\w+)/g) || []).map(h => h.slice(1));
    const post = { id, authorId, content, image: image || null, video: video || null, privacy: privacy || 'public', likesCount: 0, commentsCount: 0, sharesCount: 0, hashtags, createdAt: ts() };
    this.posts.set(id, post);
    return post;
  },
  deletePost(id) { return this.posts.delete(id); },

  // ── Comments ───────────────────────────────────────────────────────────────
  getPostComments(postId) {
    return [...this.comments.values()]
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  createComment({ postId, authorId, content }) {
    const id = `cmt-${uuidv4()}`;
    const comment = { id, postId, authorId, content, likesCount: 0, createdAt: ts() };
    this.comments.set(id, comment);
    const post = this.posts.get(postId);
    if (post) post.commentsCount++;
    return comment;
  },

  // ── Likes ──────────────────────────────────────────────────────────────────
  toggleLike(userId, postId) {
    const key = `${userId}:${postId}`;
    const post = this.posts.get(postId);
    if (!post) return null;
    if (this.likes.has(key)) {
      this.likes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
      return { liked: false, count: post.likesCount };
    } else {
      this.likes.set(key, { userId, postId, createdAt: ts() });
      post.likesCount++;
      return { liked: true, count: post.likesCount };
    }
  },
  hasLiked(userId, postId) { return this.likes.has(`${userId}:${postId}`); },

  // ── Follows ────────────────────────────────────────────────────────────────
  toggleFollow(followerId, followedId) {
    const key = `${followerId}:${followedId}`;
    const follower = this.users.get(followerId);
    const followed = this.users.get(followedId);
    if (!follower || !followed) return null;
    if (this.follows.has(key)) {
      this.follows.delete(key);
      follower.followingCount = Math.max(0, follower.followingCount - 1);
      followed.followersCount = Math.max(0, followed.followersCount - 1);
      return { following: false };
    } else {
      this.follows.set(key, { followerId, followedId, createdAt: ts() });
      follower.followingCount++;
      followed.followersCount++;
      return { following: true };
    }
  },
  isFollowing(followerId, followedId) { return this.follows.has(`${followerId}:${followedId}`); },

  // ── Friend Requests ────────────────────────────────────────────────────────
  sendFriendRequest(fromId, toId) {
    const existing = [...this.friendRequests.values()].find(r =>
      (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
    );
    if (existing) return existing;
    const id = `fr-${uuidv4()}`;
    const req = { id, fromId, toId, status: 'pending', createdAt: ts() };
    this.friendRequests.set(id, req);
    return req;
  },
  respondFriendRequest(requestId, action) {
    const req = this.friendRequests.get(requestId);
    if (!req) return null;
    req.status = action === 'accept' ? 'accepted' : 'declined';
    if (action === 'accept') {
      this.follows.set(`${req.fromId}:${req.toId}`, { followerId: req.fromId, followedId: req.toId, createdAt: ts() });
      this.follows.set(`${req.toId}:${req.fromId}`, { followerId: req.toId, followedId: req.fromId, createdAt: ts() });
    }
    return req;
  },
  getPendingRequests(userId) {
    return [...this.friendRequests.values()].filter(r => r.toId === userId && r.status === 'pending');
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  createNotification({ userId, type, actorId, postId, commentId, message }) {
    const id = `notif-${uuidv4()}`;
    const notif = { id, userId, type, actorId, postId: postId || null, commentId: commentId || null, message, read: false, createdAt: ts() };
    this.notifications.set(id, notif);
    return notif;
  },
  getUserNotifications(userId) {
    return [...this.notifications.values()]
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
  },
  markNotificationsRead(userId) {
    for (const n of this.notifications.values()) {
      if (n.userId === userId) n.read = true;
    }
  },

  // ── Trending ───────────────────────────────────────────────────────────────
  getTrending() {
    const counts = {};
    for (const post of this.posts.values()) {
      for (const tag of (post.hashtags || [])) {
        counts[tag] = (counts[tag] || 0) + post.likesCount + post.commentsCount + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  search(query) {
    const q = query.toLowerCase();
    const users = [...this.users.values()]
      .filter(u => u.username.includes(q) || u.displayName.toLowerCase().includes(q))
      .map(u => this.safeUser(u))
      .slice(0, 10);
    const posts = [...this.posts.values()]
      .filter(p => p.content.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    return { users, posts };
  },

  // ── Suggestions ────────────────────────────────────────────────────────────
  getSuggestions(userId) {
    return [...this.users.values()]
      .filter(u => u.id !== userId && !this.isFollowing(userId, u.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(u => this.safeUser(u));
  },
};
