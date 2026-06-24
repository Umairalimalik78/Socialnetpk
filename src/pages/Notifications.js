// ── Notifications Page ────────────────────────────────────────────────────────
import { api } from '../api.js';
import { setState, getState } from '../store.js';
import { timeAgo } from '../utils.js';
import { showToast } from '../components/Toast.js';
import { updateNotifBadge } from '../components/Navbar.js';

const TYPE_ICONS = {
  like: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  comment: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  follow: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  friend_request: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
  friend_accepted: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
};

export async function renderNotificationsPage(container, navigate) {
  container.className = 'main-content page-enter';
  container.innerHTML = `
    <div class="feed-header" style="display:flex;align-items:center;justify-content:space-between;">
      <h2>Notifications</h2>
      <button class="btn btn-ghost btn-sm" id="mark-all-read-btn">Mark all as read</button>
    </div>

    <!-- Friend Requests Section -->
    <div id="friend-requests-section" style="border-bottom:1px solid var(--border-color);"></div>

    <!-- Tabs -->
    <div class="tab-nav">
      <button class="tab-nav-item active" data-tab="all">All</button>
      <button class="tab-nav-item" data-tab="likes">Likes</button>
      <button class="tab-nav-item" data-tab="comments">Comments</button>
      <button class="tab-nav-item" data-tab="follows">Follows</button>
    </div>

    <div id="notif-page-list">
      <div class="loading-spinner"><div class="spinner"></div></div>
    </div>
  `;

  let allNotifs = [];

  // Load friend requests
  loadFriendRequests(container, navigate);

  // Load notifications
  try {
    const { notifications } = await api.getNotifications();
    allNotifs = notifications;

    // Mark as read
    setState('unreadCount', 0);
    updateNotifBadge();
    await api.markNotificationsRead().catch(() => {});

    renderNotifList(container, allNotifs, navigate);
  } catch {
    container.querySelector('#notif-page-list').innerHTML =
      `<div class="empty-state"><h3>Failed to load</h3><p>Check server connection.</p></div>`;
  }

  // Mark all read button
  container.querySelector('#mark-all-read-btn')?.addEventListener('click', async () => {
    await api.markNotificationsRead().catch(() => {});
    container.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    showToast('All notifications marked as read', 'success');
  });

  // Tabs
  container.querySelectorAll('.tab-nav-item').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab-nav-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.tab;
      const filtered = type === 'all' ? allNotifs :
        type === 'likes' ? allNotifs.filter(n => n.type === 'like') :
        type === 'comments' ? allNotifs.filter(n => n.type === 'comment') :
        allNotifs.filter(n => ['follow', 'friend_request', 'friend_accepted'].includes(n.type));
      renderNotifList(container, filtered, navigate);
    });
  });
}

function renderNotifList(container, notifs, navigate) {
  const listEl = container.querySelector('#notif-page-list');
  if (!listEl) return;

  if (notifs.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <h3>All caught up!</h3>
        <p>No notifications here yet.</p>
      </div>`;
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" style="cursor:pointer;">
      <div class="notif-icon ${n.type}">
        ${TYPE_ICONS[n.type] || TYPE_ICONS.follow}
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        ${n.actor ? `
          <img src="${n.actor.avatar}" alt="${n.actor.displayName}" class="avatar avatar-md"
               onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.username}'"
               style="cursor:pointer;" data-actor-id="${n.actor.id}" />
        ` : ''}
        <div class="notif-content" style="flex:1;min-width:0;">
          <div class="notif-message">
            <strong>${n.actor?.displayName || 'Someone'}</strong> ${n.message.replace(n.actor?.displayName + ' ', '')}
          </div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.read ? '<div style="width:8px;height:8px;background:var(--accent-blue);border-radius:50%;flex-shrink:0;"></div>' : ''}
      </div>
    </div>
  `).join('');

  // Click to navigate
  listEl.querySelectorAll('.notif-item').forEach((item, i) => {
    const n = notifs[i];
    item.addEventListener('click', (e) => {
      const actorImg = e.target.closest('[data-actor-id]');
      if (actorImg) { navigate('profile', { id: actorImg.dataset.actorId }); return; }
      if (n.postId) navigate('home');
      else if (n.actorId) navigate('profile', { id: n.actorId });
    });
  });
}

async function loadFriendRequests(container, navigate) {
  const section = container.querySelector('#friend-requests-section');
  if (!section) return;
  try {
    const { requests } = await api.getFriendRequests();
    if (!requests.length) { section.style.display = 'none'; return; }

    section.innerHTML = `
      <div style="padding:16px 20px;background:rgba(120,86,255,0.05);">
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">
          Friend Requests (${requests.length})
        </div>
        <div id="friend-req-list" style="display:flex;flex-direction:column;gap:12px;">
          ${requests.map(r => `
            <div class="friend-req-item" style="display:flex;align-items:center;gap:12px;" data-req-id="${r.id}">
              <img src="${r.from.avatar}" alt="${r.from.displayName}" class="avatar avatar-md"
                   onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${r.from.username}'" />
              <div style="flex:1;">
                <div style="font-weight:600;font-size:14px;">${r.from.displayName}</div>
                <div style="font-size:12px;color:var(--text-secondary);">@${r.from.username}</div>
              </div>
              <button class="btn btn-primary btn-sm accept-btn" data-req-id="${r.id}">Accept</button>
              <button class="btn btn-outline btn-sm decline-btn" data-req-id="${r.id}">Decline</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Accept/Decline handlers
    section.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await handleFriendResponse(btn.dataset.reqId, 'accept', section);
      });
    });
    section.querySelectorAll('.decline-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await handleFriendResponse(btn.dataset.reqId, 'decline', section);
      });
    });
  } catch { section.style.display = 'none'; }
}

async function handleFriendResponse(reqId, action, section) {
  try {
    await api.respondFriendRequest(reqId, action);
    const item = section.querySelector(`[data-req-id="${reqId}"]`);
    item?.remove();
    showToast(action === 'accept' ? 'Friend request accepted! 🎉' : 'Request declined.', action === 'accept' ? 'success' : 'info');
    // Hide section if no more requests
    if (!section.querySelectorAll('.friend-req-item').length) section.style.display = 'none';
  } catch (err) {
    showToast(err.message, 'error');
  }
}
