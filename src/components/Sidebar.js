// ── Left Sidebar ─────────────────────────────────────────────────────────────
import { getCurrentUser } from '../store.js';
import { formatCount } from '../utils.js';

const NAV_ITEMS = [
  { id: 'home',          label: 'Home',          icon: 'home' },
  { id: 'explore',       label: 'Explore',        icon: 'compass' },
  { id: 'notifications', label: 'Notifications',  icon: 'bell', badge: true },
  { id: 'profile',       label: 'Profile',        icon: 'user' },
  { id: 'settings',      label: 'Settings',       icon: 'settings' },
];

const ICONS = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  compass: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

export function renderSidebar(currentPage, navigate, unreadCount = 0) {
  const user = getCurrentUser();
  const el = document.createElement('aside');
  el.className = 'left-sidebar';
  el.id = 'left-sidebar';

  el.innerHTML = `
    <!-- Profile Mini Card -->
    <div class="profile-mini-card">
      <img src="${user?.coverPhoto || `https://picsum.photos/seed/${user?.username}/1200/400`}"
           alt="Cover" class="profile-mini-cover"
           onerror="this.style.background='var(--gradient-primary)';" />
      <div class="profile-mini-body">
        <img src="${user?.avatar}" alt="${user?.displayName}"
             class="profile-mini-avatar"
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}'" />
        <div class="profile-mini-name">${user?.displayName}</div>
        <div class="profile-mini-username">@${user?.username}</div>
        ${user?.bio ? `<div class="profile-mini-bio">${user.bio}</div>` : ''}
        <div class="profile-mini-stats">
          <div class="profile-mini-stat">
            <div class="profile-mini-stat-value">${formatCount(user?.followingCount || 0)}</div>
            <div class="profile-mini-stat-label">Following</div>
          </div>
          <div class="profile-mini-stat">
            <div class="profile-mini-stat-value">${formatCount(user?.followersCount || 0)}</div>
            <div class="profile-mini-stat-label">Followers</div>
          </div>
        </div>
        <button class="btn btn-outline w-full" id="sidebar-profile-btn" style="width:100%;">My Profile</button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav" aria-label="Main navigation">
      ${NAV_ITEMS.map(item => `
        <button
          class="sidebar-nav-item ${currentPage === item.id ? 'active' : ''}"
          data-page="${item.id}"
          aria-current="${currentPage === item.id ? 'page' : 'false'}"
          id="nav-${item.id}"
        >
          <span class="nav-item-icon">${ICONS[item.icon]}</span>
          <span>${item.label}</span>
          ${item.badge && unreadCount > 0 ? `<span class="badge badge-red nav-badge">${unreadCount}</span>` : ''}
        </button>
      `).join('')}
    </nav>

    <!-- Compose Button -->
    <div style="padding: 16px 8px; margin-top: 8px;">
      <button class="btn btn-gradient w-full btn-lg" id="sidebar-compose-btn" style="width:100%;font-size:15px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Post
      </button>
    </div>
  `;

  // Wire navigation
  el.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'profile') navigate('profile', { id: user?.id });
      else navigate(page);
    });
  });

  el.querySelector('#sidebar-profile-btn')?.addEventListener('click', () => {
    navigate('profile', { id: user?.id });
  });

  el.querySelector('#sidebar-compose-btn')?.addEventListener('click', () => {
    document.getElementById('post-composer-textarea')?.focus();
    document.getElementById('post-composer-textarea')?.scrollIntoView({ behavior: 'smooth' });
    navigate('home');
  });

  return el;
}
