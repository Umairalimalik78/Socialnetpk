// WebSocket Manager — handles connections and broadcasts
const clients = new Map(); // userId → Set<WebSocket>

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId');

    if (userId) {
      if (!clients.has(userId)) clients.set(userId, new Set());
      clients.get(userId).add(ws);
      // Broadcast online status
      broadcastAll({ type: 'user_online', userId }, userId);
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
      } catch {}
    });

    ws.on('close', () => {
      if (userId && clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) {
          clients.delete(userId);
          broadcastAll({ type: 'user_offline', userId }, userId);
        }
      }
    });

    ws.on('error', () => {});
    ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to SocialNet!' }));
  });
}

// Send to a specific user
export function sendToUser(userId, data) {
  const conns = clients.get(userId);
  if (!conns) return;
  const payload = JSON.stringify(data);
  for (const ws of conns) {
    try { if (ws.readyState === 1) ws.send(payload); } catch {}
  }
}

// Broadcast to all connected users, optionally excluding one
export function broadcastAll(data, excludeUserId = null) {
  const payload = JSON.stringify(data);
  for (const [uid, conns] of clients) {
    if (uid === excludeUserId) continue;
    for (const ws of conns) {
      try { if (ws.readyState === 1) ws.send(payload); } catch {}
    }
  }
}

// Broadcast new post to all users
export function broadcastNewPost(post, author) {
  broadcastAll({ type: 'new_post', post, author }, author.id);
}

// Send notification to specific user
export function sendNotification(userId, notification) {
  sendToUser(userId, { type: 'notification', notification });
}

export function getOnlineUsers() {
  return [...clients.keys()];
}
