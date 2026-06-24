// ── REST API Client ───────────────────────────────────────────────────────────
import { getToken } from './store.js';

const BASE_URL = '/api';

async function request(method, path, body = null, formData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!formData) headers['Content-Type'] = 'application/json';

  const opts = {
    method,
    headers,
    body: body ? (formData ? body : JSON.stringify(body)) : undefined,
  };

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),

  // Feed & Posts
  getFeed: (before) => request('GET', `/posts${before ? `?before=${before}` : ''}`),
  getPost: (id) => request('GET', `/posts/${id}`),
  createPost: (body) => request('POST', '/posts', body),
  deletePost: (id) => request('DELETE', `/posts/${id}`),
  likePost: (id) => request('POST', `/posts/${id}/like`),
  getTrending: () => request('GET', '/posts/trending'),

  // Comments
  getComments: (postId) => request('GET', `/posts/${postId}/comments`),
  addComment: (postId, content) => request('POST', `/posts/${postId}/comments`, { content }),

  // Users
  getUser: (id) => request('GET', `/users/${id}`),
  updateUser: (id, body) => request('PUT', `/users/${id}`, body),
  followUser: (id) => request('POST', `/users/${id}/follow`),
  sendFriendRequest: (id) => request('POST', `/users/${id}/friend-request`),
  respondFriendRequest: (id, action) => request('POST', `/users/friend-requests/${id}/respond`, { action }),
  getUserPosts: (id) => request('GET', `/users/${id}/posts`),
  getSuggestions: () => request('GET', '/users/suggestions'),
  searchUsers: (q) => request('GET', `/users?q=${encodeURIComponent(q)}`),

  // Notifications
  getNotifications: () => request('GET', '/notifications'),
  markNotificationsRead: () => request('PUT', '/notifications/read'),
  getFriendRequests: () => request('GET', '/notifications/friend-requests'),

  // Search (posts)
  search: async (q) => {
    const [users, feed] = await Promise.all([
      request('GET', `/users?q=${encodeURIComponent(q)}`).catch(() => ({ users: [] })),
      request('GET', `/posts?limit=20`).catch(() => ({ posts: [] })),
    ]);
    const lq = q.toLowerCase();
    const posts = (feed.posts || []).filter(p => p.content.toLowerCase().includes(lq));
    return { users: users.users || [], posts };
  },
};
