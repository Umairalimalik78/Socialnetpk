// ── WebSocket Client Manager ──────────────────────────────────────────────────
import { setState, getState } from './store.js';
import { showToast } from './components/Toast.js';

let ws = null;
let reconnectTimer = null;
let pingInterval = null;
const handlers = {};

export function onWsEvent(type, fn) {
  if (!handlers[type]) handlers[type] = [];
  handlers[type].push(fn);
  return () => { handlers[type] = handlers[type].filter(f => f !== fn); };
}

function dispatch(type, data) {
  (handlers[type] || []).forEach(fn => fn(data));
  (handlers['*'] || []).forEach(fn => fn({ type, ...data }));
}

export function connectSocket(userId) {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  const wsHost = window.location.hostname || 'localhost';
  const url = `ws://${wsHost}:3001/ws?userId=${userId}`;

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      clearTimeout(reconnectTimer);
      pingInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch { }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      clearInterval(pingInterval);
      scheduleReconnect(userId);
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch { }
}

function handleMessage(msg) {
  switch (msg.type) {
    case 'new_post': {
      const state = getState();
      const newPosts = [...(state.pendingNewPosts || []), msg.post];
      setState('pendingNewPosts', newPosts);
      dispatch('new_post', msg);
      break;
    }
    case 'notification': {
      const state = getState();
      setState('unreadCount', (state.unreadCount || 0) + 1);
      setState('notifications', [msg.notification, ...(state.notifications || [])]);
      dispatch('notification', msg.notification);
      showToast(msg.notification.message, 'info');
      break;
    }
    case 'user_online': {
      const s = getState();
      const online = new Set(s.onlineUsers);
      online.add(msg.userId);
      setState('onlineUsers', online);
      dispatch('user_online', msg);
      break;
    }
    case 'user_offline': {
      const s = getState();
      const online = new Set(s.onlineUsers);
      online.delete(msg.userId);
      setState('onlineUsers', online);
      dispatch('user_offline', msg);
      break;
    }
    case 'follow_update':
      dispatch('follow_update', msg);
      break;
    default:
      dispatch(msg.type, msg);
  }
}

function scheduleReconnect(userId) {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => connectSocket(userId), 3000);
}

export function disconnectSocket() {
  clearTimeout(reconnectTimer);
  clearInterval(pingInterval);
  ws?.close();
  ws = null;
}

export function getWs() { return ws; }
