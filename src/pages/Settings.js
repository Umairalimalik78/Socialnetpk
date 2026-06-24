// ── Settings Page ─────────────────────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, clearAuth } from '../store.js';
import { showToast } from '../components/Toast.js';
import { confirmModal } from '../components/Modal.js';

export function renderSettingsPage(container, navigate) {
  const user = getCurrentUser();
  container.className = 'main-content page-enter';

  container.innerHTML = `
    <div class="feed-header">
      <h2>Settings</h2>
    </div>

    <!-- Account Section -->
    <div class="settings-section">
      <div class="settings-section-title">Account</div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Display Name</h4>
          <p>${user?.displayName || '—'}</p>
        </div>
        <button class="btn btn-outline btn-sm" id="edit-name-btn">Edit</button>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Username</h4>
          <p>@${user?.username || '—'}</p>
        </div>
        <button class="btn btn-outline btn-sm" id="edit-username-btn">Edit</button>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Email Address</h4>
          <p>${user?.email || '—'}</p>
        </div>
        <button class="btn btn-outline btn-sm">Edit</button>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Password</h4>
          <p>Last changed: Never</p>
        </div>
        <button class="btn btn-outline btn-sm">Change</button>
      </div>
    </div>

    <!-- Privacy Section -->
    <div class="settings-section">
      <div class="settings-section-title">Privacy</div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Default Post Visibility</h4>
          <p>Control who can see your posts by default</p>
        </div>
        <select class="input-field" id="default-privacy" style="width:auto;height:36px;font-size:13px;">
          <option value="public" ${user?.privacy === 'public' ? 'selected' : ''}>🌍 Public</option>
          <option value="friends" ${user?.privacy === 'friends' ? 'selected' : ''}>👥 Friends Only</option>
          <option value="private" ${user?.privacy === 'private' ? 'selected' : ''}>🔒 Private</option>
        </select>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Private Account</h4>
          <p>Only approved followers can see your posts</p>
        </div>
        <label class="toggle">
          <input type="checkbox" id="private-account-toggle" ${user?.privacy === 'private' ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Who Can Send Friend Requests</h4>
          <p>Control who can send you requests</p>
        </div>
        <select class="input-field" style="width:auto;height:36px;font-size:13px;">
          <option>Everyone</option>
          <option>Friends of Friends</option>
          <option>No One</option>
        </select>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Show Online Status</h4>
          <p>Let others see when you're active</p>
        </div>
        <label class="toggle">
          <input type="checkbox" checked id="online-status-toggle" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- Notifications Section -->
    <div class="settings-section">
      <div class="settings-section-title">Notifications</div>

      ${[
        { id: 'notif-likes', label: 'Likes', desc: 'When someone likes your posts' },
        { id: 'notif-comments', label: 'Comments', desc: 'When someone comments on your posts' },
        { id: 'notif-follows', label: 'New Followers', desc: 'When someone follows you' },
        { id: 'notif-friend-req', label: 'Friend Requests', desc: 'When someone sends you a request' },
      ].map(item => `
        <div class="settings-option">
          <div class="settings-option-info">
            <h4>${item.label}</h4>
            <p>${item.desc}</p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="${item.id}" checked />
            <span class="toggle-slider"></span>
          </label>
        </div>
      `).join('')}
    </div>

    <!-- Appearance Section -->
    <div class="settings-section">
      <div class="settings-section-title">Appearance</div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Theme</h4>
          <p>Currently using Dark theme</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" id="theme-dark" style="background:var(--bg-tertiary);border:2px solid var(--accent-blue);">🌙 Dark</button>
          <button class="btn btn-outline btn-sm" id="theme-light">☀️ Light</button>
        </div>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Accent Color</h4>
          <p>Choose your preferred accent color</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${[
            ['#1d9bf0', 'Blue'],
            ['#7856ff', 'Purple'],
            ['#f91880', 'Pink'],
            ['#3fb950', 'Green'],
            ['#fb8f44', 'Orange'],
          ].map(([color, name]) => `
            <button class="accent-color-btn" data-color="${color}" title="${name}" style="
              width:28px;height:28px;border-radius:50%;background:${color};border:2px solid transparent;
              cursor:pointer;transition:transform 0.2s,border-color 0.2s;
              ${color === '#1d9bf0' ? 'border-color:white;transform:scale(1.2);' : ''}
            "></button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Profile Section -->
    <div class="settings-section">
      <div class="settings-section-title">Profile</div>
      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Edit Profile</h4>
          <p>Update your bio, location, and website</p>
        </div>
        <button class="btn btn-outline btn-sm" id="goto-profile-btn">Edit Profile</button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="settings-section">
      <div class="settings-section-title" style="color:var(--accent-red);">Danger Zone</div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Log Out</h4>
          <p>Sign out of your account on this device</p>
        </div>
        <button class="btn btn-danger btn-sm" id="settings-logout-btn">Log Out</button>
      </div>

      <div class="settings-option">
        <div class="settings-option-info">
          <h4>Delete Account</h4>
          <p>Permanently remove your account and all data</p>
        </div>
        <button class="btn btn-danger btn-sm" id="delete-account-btn">Delete Account</button>
      </div>
    </div>

    <!-- Save button (sticky) -->
    <div style="padding:20px;border-top:1px solid var(--border-color);position:sticky;bottom:0;background:var(--bg-secondary);backdrop-filter:blur(12px);">
      <button class="btn btn-gradient btn-lg" id="save-settings-btn" style="width:100%;">Save Settings</button>
    </div>
  `;

  // Privacy toggles sync
  const privacySelect = container.querySelector('#default-privacy');
  const privateToggle = container.querySelector('#private-account-toggle');
  privacySelect?.addEventListener('change', () => {
    if (privacySelect.value === 'private') privateToggle.checked = true;
  });
  privateToggle?.addEventListener('change', () => {
    if (privateToggle.checked) privacySelect.value = 'private';
    else if (privacySelect.value === 'private') privacySelect.value = 'public';
  });

  // Accent color
  container.querySelectorAll('.accent-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.accent-color-btn').forEach(b => {
        b.style.borderColor = 'transparent';
        b.style.transform = 'scale(1)';
      });
      btn.style.borderColor = 'white';
      btn.style.transform = 'scale(1.2)';
      document.documentElement.style.setProperty('--accent-blue', btn.dataset.color);
      document.documentElement.style.setProperty('--accent-blue-hover', btn.dataset.color + 'dd');
      showToast('Accent color updated!', 'success');
    });
  });

  // Save settings
  container.querySelector('#save-settings-btn')?.addEventListener('click', async () => {
    const btn = container.querySelector('#save-settings-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      const privacy = privacySelect?.value || 'public';
      await api.updateUser(user.id, { privacy });
      const stored = JSON.parse(localStorage.getItem('sn_user') || '{}');
      localStorage.setItem('sn_user', JSON.stringify({ ...stored, privacy }));
      showToast('Settings saved! ✅', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Settings';
    }
  });

  // Go to profile
  container.querySelector('#goto-profile-btn')?.addEventListener('click', () => {
    navigate('profile', { id: user?.id });
  });

  // Logout
  container.querySelector('#settings-logout-btn')?.addEventListener('click', async () => {
    const ok = await confirmModal('Log Out', 'Are you sure you want to log out?');
    if (ok) {
      clearAuth();
      navigate('login');
    }
  });

  // Delete account
  container.querySelector('#delete-account-btn')?.addEventListener('click', async () => {
    const ok = await confirmModal('Delete Account', 'This will permanently delete your account and all your data. This action cannot be undone. Are you absolutely sure?');
    if (ok) {
      clearAuth();
      showToast('Account deleted.', 'info');
      navigate('login');
    }
  });
}
