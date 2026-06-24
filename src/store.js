// ── Client-side State Store ───────────────────────────────────────────────────
const state = {
  currentUser: null,
  token: null,
  posts: [],
  notifications: [],
  unreadCount: 0,
  onlineUsers: new Set(),
  pendingNewPosts: [],
};

const listeners = {};

export function getState() { return state; }

export function setState(key, value) {
  state[key] = value;
  emit(key, value);
}

export function on(key, fn) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(fn);
  return () => { listeners[key] = listeners[key].filter(f => f !== fn); };
}

function emit(key, value) {
  (listeners[key] || []).forEach(fn => fn(value));
}

// ── Auth Helpers ──────────────────────────────────────────────────────────────
export function saveAuth(token, user) {
  localStorage.setItem('sn_token', token);
  localStorage.setItem('sn_user', JSON.stringify(user));
  state.token = token;
  state.currentUser = user;
}

export function loadAuth() {
  const token = localStorage.getItem('sn_token');
  const user = localStorage.getItem('sn_user');
  if (token && user) {
    state.token = token;
    state.currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

export function clearAuth() {
  localStorage.removeItem('sn_token');
  localStorage.removeItem('sn_user');
  state.token = null;
  state.currentUser = null;
}

export function isLoggedIn() {
  return !!state.token && !!state.currentUser;
}

export function getToken() { return state.token; }
export function getCurrentUser() { return state.currentUser; }
