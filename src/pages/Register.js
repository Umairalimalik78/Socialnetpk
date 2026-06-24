// ── Register Page ─────────────────────────────────────────────────────────────
import { api } from '../api.js';
import { saveAuth } from '../store.js';
import { showToast } from '../components/Toast.js';

export function renderRegisterPage(navigate) {
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
            <circle cx="20" cy="20" r="20" fill="url(#reggrad)"/>
            <path d="M12 14C12 14 16 20 20 20C24 20 28 14 28 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="14" cy="26" r="3" fill="white" opacity="0.8"/>
            <circle cx="20" cy="28" r="3" fill="white"/>
            <circle cx="26" cy="26" r="3" fill="white" opacity="0.8"/>
            <defs>
              <linearGradient id="reggrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#1d9bf0"/>
                <stop offset="100%" stop-color="#7856ff"/>
              </linearGradient>
            </defs>
          </svg>
          SocialNet
        </div>
        <h1 class="auth-hero-tagline">Your story<br/>starts here.</h1>
        <p class="auth-hero-sub">Join SocialNet and start connecting with people who share your interests.</p>
        <div class="auth-hero-features">
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Free to join, always
          </div>
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Connect with friends instantly
          </div>
          <div class="auth-hero-feature">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Full privacy controls on every post
          </div>
        </div>
      </div>
    </div>

    <!-- Form Side -->
    <div class="auth-form-side">
      <div class="auth-form">
        <h2 class="auth-form-title">Create your account</h2>
        <p class="auth-form-subtitle">Join SocialNet today — it's free!</p>

        <div class="auth-form-fields">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="input-group">
              <label class="input-label" for="reg-displayname">Display Name</label>
              <input class="input-field" id="reg-displayname" type="text" placeholder="Jane Doe" autocomplete="name" />
            </div>
            <div class="input-group">
              <label class="input-label" for="reg-username">Username</label>
              <div class="input-with-icon">
                <span class="input-icon" style="font-size:14px;font-weight:600;color:var(--text-muted);">@</span>
                <input class="input-field" id="reg-username" type="text" placeholder="janedoe" autocomplete="username" style="padding-left:32px;" />
              </div>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label" for="reg-email">Email address</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input class="input-field" id="reg-email" type="email" placeholder="jane@example.com" autocomplete="email" />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label" for="reg-password">Password</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input class="input-field" id="reg-password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" />
            </div>
            <div id="password-strength" style="height:3px;border-radius:2px;background:var(--bg-hover);margin-top:6px;overflow:hidden;">
              <div id="password-strength-bar" style="height:100%;width:0;background:var(--accent-red);transition:all 0.3s;border-radius:2px;"></div>
            </div>
          </div>
          <div id="reg-error" style="color:var(--accent-red);font-size:13px;display:none;"></div>
          <button class="btn btn-gradient btn-lg" id="register-btn" style="width:100%;">Create Account</button>
        </div>

        <div class="auth-form-footer">
          Already have an account? <a href="#" id="go-login">Sign in</a>
        </div>
      </div>
    </div>
  `;

  const errEl = el.querySelector('#reg-error');
  const regBtn = el.querySelector('#register-btn');
  const passInput = el.querySelector('#reg-password');
  const strengthBar = el.querySelector('#password-strength-bar');

  // Password strength
  passInput.addEventListener('input', () => {
    const v = passInput.value;
    const strength = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    const colors = ['var(--accent-red)', 'var(--accent-orange)', 'var(--accent-yellow)', 'var(--accent-green)'];
    strengthBar.style.width = `${strength * 25}%`;
    strengthBar.style.background = colors[strength - 1] || 'var(--accent-red)';
  });

  const doRegister = async () => {
    const displayName = el.querySelector('#reg-displayname').value.trim();
    const username = el.querySelector('#reg-username').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const email = el.querySelector('#reg-email').value.trim();
    const password = passInput.value;

    if (!displayName || !username || !email || !password) { showErr('All fields are required.'); return; }
    if (password.length < 6) { showErr('Password must be at least 6 characters.'); return; }

    regBtn.disabled = true;
    regBtn.textContent = 'Creating account...';
    errEl.style.display = 'none';

    try {
      const { token, user } = await api.register({ displayName, username, email, password });
      saveAuth(token, user);
      showToast('Welcome to SocialNet! 🎉', 'success');
      navigate('home');
    } catch (err) {
      showErr(err.message || 'Registration failed.');
    } finally {
      regBtn.disabled = false;
      regBtn.textContent = 'Create Account';
    }
  };

  function showErr(msg) { errEl.textContent = msg; errEl.style.display = 'block'; }

  regBtn.addEventListener('click', doRegister);
  el.querySelector('#go-login')?.addEventListener('click', (e) => { e.preventDefault(); navigate('login'); });

  return el;
}
