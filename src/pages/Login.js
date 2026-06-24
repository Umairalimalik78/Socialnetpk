// ── Login Page ────────────────────────────────────────────────────────────────
import { api } from '../api.js';
import { saveAuth } from '../store.js';
import { showToast } from '../components/Toast.js';

const DEMO_ACCOUNTS = [
  { email: 'alex@socialnet.app', name: 'Alex Nova', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
  { email: 'luna@socialnet.app', name: 'Luna Creative', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna' },
  { email: 'dev@socialnet.app', name: 'DevPulse', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devpulse' },
  { email: 'sophia@socialnet.app', name: 'Sophia World', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia' },
  { email: 'tech@socialnet.app', name: 'Tech Current', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techcurrent' },
];

export function renderLoginPage(navigate) {
  const el = document.createElement('div');
  el.className = 'auth-layout';

  el.innerHTML = `
    <!-- Hero Side -->
    <div class="auth-hero">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="auth-hero-content">
        <div class="auth-hero-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="url(#herograd)"/>
            <path d="M12 14C12 14 16 20 20 20C24 20 28 14 28 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="14" cy="26" r="3" fill="white" opacity="0.8"/>
            <circle cx="20" cy="28" r="3" fill="white"/>
            <circle cx="26" cy="26" r="3" fill="white" opacity="0.8"/>
            <defs>
              <linearGradient id="herograd" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#1d9bf0"/>
                <stop offset="100%" stop-color="#7856ff"/>
              </linearGradient>
            </defs>
          </svg>
          SocialNet
        </div>

        <h1 class="auth-hero-tagline">Connect.<br/>Share.<br/>Discover.</h1>
        <p class="auth-hero-sub">Join millions of people sharing moments, ideas, and connecting with the world in real time.</p>

        <div class="auth-hero-features">
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.94 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Real-time updates via WebSockets
          </div>
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Follow friends, discover new people
          </div>
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Share photos, videos & thoughts
          </div>
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Privacy controls for every post
          </div>
        </div>
      </div>
    </div>

    <!-- Form Side -->
    <div class="auth-form-side">
      <div class="auth-form">
        <h2 class="auth-form-title">Welcome back</h2>
        <p class="auth-form-subtitle">Sign in to your SocialNet account</p>

        <div class="auth-form-fields">
          <div class="input-group">
            <label class="input-label" for="login-email">Email address</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input class="input-field" id="login-email" type="email" placeholder="you@example.com" autocomplete="email" />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label" for="login-password">Password</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input class="input-field" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password" />
            </div>
          </div>
          <div id="login-error" style="color:var(--accent-red);font-size:13px;display:none;"></div>
          <button class="btn btn-gradient btn-lg w-full" id="login-btn" style="width:100%;">Sign In</button>
        </div>

        <div class="auth-form-footer">
          Don't have an account? <a href="#" id="go-register">Create one</a>
        </div>

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <div class="demo-accounts-title">🚀 Try a demo account (password: "password")</div>
          ${DEMO_ACCOUNTS.map(a => `
            <button class="demo-account-btn" data-email="${a.email}" aria-label="Login as ${a.name}">
              <img src="${a.avatar}" alt="${a.name}" class="avatar avatar-xs" />
              <span>${a.name}</span>
              <span style="margin-left:auto;font-size:11px;color:var(--text-muted);">${a.email}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // ── Event handlers ─────────────────────────────────────────────────────────
  const emailInput = el.querySelector('#login-email');
  const passInput = el.querySelector('#login-password');
  const errEl = el.querySelector('#login-error');
  const loginBtn = el.querySelector('#login-btn');

  const doLogin = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !password) { showError('Please fill in all fields.'); return; }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    errEl.style.display = 'none';

    try {
      const { token, user } = await api.login({ email, password });
      saveAuth(token, user);
      navigate('home');
    } catch (err) {
      showError(err.message || 'Login failed. Try again.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  };

  function showError(msg) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }

  loginBtn.addEventListener('click', doLogin);
  [emailInput, passInput].forEach(inp => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); }));

  el.querySelector('#go-register')?.addEventListener('click', (e) => { e.preventDefault(); navigate('register'); });

  // Demo accounts
  el.querySelectorAll('.demo-account-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      emailInput.value = btn.dataset.email;
      passInput.value = 'password';
      await doLogin();
    });
  });

  return el;
}
