// ── Navbar Component ──────────────────────────────────────────────────────────
import { getCurrentUser, getState, setState } from '../store.js';
import { api } from '../api.js';
import { showToast } from './Toast.js';
import { timeAgo } from '../utils.js';

export function renderNavbar(navigate, onLogout) {
  const user = getCurrentUser();
  const el = document.createElement('nav');
  el.className = 'navbar main-navbar';
  el.id = 'main-navbar';

  el.innerHTML = `
    <a href="#" class="navbar-brand" id="nav-brand" aria-label="SocialNet Home">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="url(#navgrad)"/>
        <path d="M12 14C12 14 16 20 20 20C24 20 28 14 28 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="14" cy="26" r="3" fill="white" opacity="0.8"/>
        <circle cx="20" cy="28" r="3" fill="white"/>
        <circle cx="26" cy="26" r="3" fill="white" opacity="0.8"/>
        <defs>
          <linearGradient id="navgrad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stop-color="#1d9bf0"/>
            <stop offset="100%" stop-color="#7856ff"/>
          </linearGradient>
        </defs>
      </svg>
      <span>SocialNet</span>
    </a>

    <div class="navbar-search" style="flex:1;max-width:380px;margin:0 auto;">
      <div class="input-with-icon">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input id="navbar-search-input" class="input-field" placeholder="Search SocialNet..." type="search" aria-label="Search" style="height:40px;font-size:14px;" />
      </div>
    </div>

    <div class="navbar-actions">
      <button class="nav-icon-btn" id="nav-notif-btn" title="Notifications" aria-label="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span class="badge badge-red" id="notif-badge" style="display:none;">0</span>
      </button>

      <div class="relative">
        <button class="user-menu-btn" id="user-menu-btn" aria-label="User menu" aria-expanded="false">
          <img src="${user?.avatar || ''}" alt="${user?.displayName}" class="avatar avatar-sm" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user'" />
          <span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user?.displayName || 'Account'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu" id="user-dropdown" style="display:none;">
          <button class="dropdown-item" id="dd-profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </button>
          <button class="dropdown-item" id="dd-settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" id="dd-logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log Out
          </button>
        </div>
      </div>

      <!-- Notifications Dropdown -->
      <div class="relative" id="notif-dropdown-wrapper" style="position:relative;"></div>
    </div>
  `;

  // Wire up interactions after render
  requestAnimationFrame(() => {
    // Search
    const searchInput = el.querySelector('#navbar-search-input');
    let searchTimer;
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchTimer);
        navigate('explore', { q: searchInput.value.trim() });
      }
    });

    // Notification badge update
    updateNotifBadge();

    // Notif button
    const notifBtn = el.querySelector('#nav-notif-btn');
    notifBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotifDropdown(navigate);
    });

    // User menu toggle
    const menuBtn = el.querySelector('#user-menu-btn');
    const dropdown = el.querySelector('#user-dropdown');
    menuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.style.display !== 'none';
      dropdown.style.display = open ? 'none' : 'block';
      menuBtn.setAttribute('aria-expanded', String(!open));
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
      closeNotifDropdown();
    });

    el.querySelector('#dd-profile')?.addEventListener('click', () => { navigate('profile', { id: user?.id }); });
    el.querySelector('#dd-settings')?.addEventListener('click', () => { navigate('settings'); });
    el.querySelector('#dd-logout')?.addEventListener('click', () => { onLogout(); });
    el.querySelector('#nav-brand')?.addEventListener('click', (e) => { e.preventDefault(); navigate('home'); });
  });

  return el;
}

// ── Notification Badge ────────────────────────────────────────────────────────
export function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const count = getState().unreadCount || 0;
  if (count > 0) {
    badge.style.display = 'flex';
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.add('pop');
    setTimeout(() => badge.classList.remove('pop'), 400);
  } else {
    badge.style.display = 'none';
  }
}

// ── Notifications Dropdown ────────────────────────────────────────────────────
let notifDropdownOpen = false;

async function toggleNotifDropdown(navigate) {
  if (notifDropdownOpen) { closeNotifDropdown(); return; }
  notifDropdownOpen = true;

  const wrapper = document.getElementById('notif-dropdown-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="notifications-dropdown" id="notif-dropdown" style="position:absolute;top:48px;right:0;">
      <div class="notifications-header">
        <h3 style="font-size:16px;font-weight:700;">Notifications</h3>
        <button class="btn btn-ghost btn-sm" id="mark-all-read">Mark all read</button>
      </div>
      <div class="notifications-list" id="notif-list">
        <div class="loading-spinner"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  // Load notifications
  try {
    const { notifications } = await api.getNotifications();
    setState('unreadCount', 0);
    updateNotifBadge();

    const list = document.getElementById('notif-list');
    if (!list) return;

    if (!notifications.length) {
      list.innerHTML = `<div class="empty-state" style="padding:40px 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <p style="margin-top:12px;">No notifications yet</p>
      </div>`;
    } else {
      list.innerHTML = notifications.map(n => notifItemHTML(n)).join('');
    }

    document.getElementById('mark-all-read')?.addEventListener('click', async () => {
      await api.markNotificationsRead();
      list.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    });
  } catch {
    const list = document.getElementById('notif-list');
    if (list) list.innerHTML = '<p style="padding:20px;color:var(--text-secondary);">Failed to load notifications.</p>';
  }
}

function closeNotifDropdown() {
  notifDropdownOpen = false;
  const wrapper = document.getElementById('notif-dropdown-wrapper');
  if (wrapper) wrapper.innerHTML = '';
}

function notifItemHTML(n) {
  const typeIcons = {
    like: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    comment: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    follow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    friend_request: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
    friend_accepted: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  };
  return `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon ${n.type}">
        ${typeIcons[n.type] || typeIcons.follow}
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex:1;">
        ${n.actor ? `<img src="${n.actor.avatar}" alt="${n.actor.displayName}" class="avatar avatar-sm" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=u'" />` : ''}
        <div class="notif-content">
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.read ? '<div style="width:8px;height:8px;background:var(--accent-blue);border-radius:50%;flex-shrink:0;"></div>' : ''}
      </div>
    </div>
  `;
}
