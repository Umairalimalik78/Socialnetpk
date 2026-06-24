// ── SocialNet — Main Application Entry ────────────────────────────────────────
import './styles/index.css';
import './styles/components.css';
import './styles/animations.css';

import { loadAuth, isLoggedIn, getCurrentUser, getState, setState, clearAuth, on } from './store.js';
import { navigate, getCurrentRoute } from './router.js';
import { connectSocket, disconnectSocket, onWsEvent } from './socket.js';
import { renderNavbar, updateNotifBadge } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderTrendingSidebar } from './components/TrendingSidebar.js';
import { renderHomePage } from './pages/Home.js';
import { renderProfilePage } from './pages/Profile.js';
import { renderExplorePage } from './pages/Explore.js';
import { renderNotificationsPage } from './pages/Notifications.js';
import { renderSettingsPage } from './pages/Settings.js';
import { renderLoginPage } from './pages/Login.js';
import { renderRegisterPage } from './pages/Register.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function init() {
  const splash = document.getElementById('splash');
  const root = document.getElementById('root');

  // Try to restore session
  loadAuth();

  // Give a small delay for the splash animation
  await new Promise(r => setTimeout(r, 800));

  // Hide splash
  splash.classList.add('hidden');

  // Initial route
  if (isLoggedIn()) {
    connectSocket(getCurrentUser().id);
    renderApp('home', {});
  } else {
    renderAuthLayout('login', {});
  }

  // Listen to navigation events
  window.addEventListener('sn:navigate', (e) => {
    const { page, params } = e.detail;
    const AUTH_PAGES = ['login', 'register'];

    if (AUTH_PAGES.includes(page)) {
      disconnectSocket();
      renderAuthLayout(page, params);
    } else {
      if (!isLoggedIn()) {
        renderAuthLayout('login', {});
        return;
      }
      // Reconnect socket if needed
      const user = getCurrentUser();
      connectSocket(user.id);
      renderApp(page, params);
    }
  });

  // WebSocket: update notification badge globally
  onWsEvent('notification', () => {
    updateNotifBadge();
  });

  // Store changes → re-render badge
  on('unreadCount', () => updateNotifBadge());
}

// ── Auth Layout (no sidebar) ──────────────────────────────────────────────────
function renderAuthLayout(page, params) {
  const root = document.getElementById('root');
  root.innerHTML = '';

  let pageEl;
  if (page === 'register') {
    pageEl = renderRegisterPage(navigateFn);
  } else {
    pageEl = renderLoginPage(navigateFn);
  }

  root.appendChild(pageEl);
}

// ── App Layout (with sidebars) ────────────────────────────────────────────────
let currentMainContent = null;
let trendingMounted = false;

async function renderApp(page, params) {
  const root = document.getElementById('root');

  // Check if layout already exists, just swap main content
  const existingLayout = root.querySelector('.app-layout');

  if (existingLayout) {
    // Update sidebar active states
    updateSidebarActive(page);
    // Swap main content
    await swapMainContent(page, params);
  } else {
    // Build full layout from scratch
    root.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'app-layout';

    // Navbar (full width, row 1)
    const navbar = renderNavbar(navigateFn, handleLogout);
    layout.appendChild(navbar);

    // Left Sidebar
    const sidebar = renderSidebar(page, navigateFn, getState().unreadCount || 0);
    layout.appendChild(sidebar);

    // Main content area (placeholder, will be filled)
    const main = document.createElement('main');
    main.id = 'main-content-area';
    main.className = 'main-content';
    layout.appendChild(main);

    // Right Sidebar
    const rightSidebar = document.createElement('div');
    rightSidebar.id = 'right-sidebar-slot';
    rightSidebar.className = 'right-sidebar';
    rightSidebar.innerHTML = `<div class="loading-spinner" style="padding:40px;"><div class="spinner"></div></div>`;
    layout.appendChild(rightSidebar);

    root.appendChild(layout);

    // Render trending sidebar (async)
    renderTrendingSidebar(navigateFn).then(sidebarEl => {
      const slot = document.getElementById('right-sidebar-slot');
      if (slot) slot.replaceWith(sidebarEl);
    });

    // Render initial page
    await swapMainContent(page, params);
  }

  // FAB for mobile (compose)
  let fab = document.getElementById('mobile-fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'mobile-fab';
    fab.className = 'fab';
    fab.title = 'New Post';
    fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    fab.addEventListener('click', () => {
      navigateFn('home');
      setTimeout(() => document.getElementById('post-composer-textarea')?.focus(), 200);
    });
    document.body.appendChild(fab);
  }
}

async function swapMainContent(page, params) {
  const main = document.getElementById('main-content-area');
  if (!main) return;

  // Run cleanup from previous page
  if (main._cleanup) {
    main._cleanup();
    main._cleanup = null;
  }

  // Animate out
  main.style.opacity = '0';
  main.style.transition = 'opacity 0.15s ease';

  await new Promise(r => setTimeout(r, 150));
  main.innerHTML = '';
  main.style.opacity = '1';

  // Render new page into main
  switch (page) {
    case 'home':
      await renderHomePage(main, navigateFn);
      if (main._cleanup) {} // page sets its own cleanup
      break;
    case 'profile':
      await renderProfilePage(main, navigateFn, params);
      break;
    case 'explore':
      await renderExplorePage(main, navigateFn, params);
      break;
    case 'notifications':
      await renderNotificationsPage(main, navigateFn);
      break;
    case 'settings':
      renderSettingsPage(main, navigateFn);
      break;
    default:
      await renderHomePage(main, navigateFn);
  }

  // Scroll to top
  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);

  // Update sidebar active highlight
  updateSidebarActive(page);
}

function updateSidebarActive(page) {
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const itemPage = item.dataset.page;
    const isActive = itemPage === page || (page === 'profile' && itemPage === 'profile');
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function handleLogout() {
  clearAuth();
  disconnectSocket();
  // Remove app layout
  const root = document.getElementById('root');
  root.innerHTML = '';
  // Remove FAB
  document.getElementById('mobile-fab')?.remove();
  renderAuthLayout('login', {});
}

// ── Navigation function (passed to all components) ────────────────────────────
function navigateFn(page, params = {}) {
  navigate(page, params);
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
