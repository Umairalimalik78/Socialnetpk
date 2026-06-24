// ── Trending & Suggestions Sidebar ────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, isLoggedIn } from '../store.js';
import { formatCount } from '../utils.js';
import { showToast } from './Toast.js';

export async function renderTrendingSidebar(navigate) {
  const el = document.createElement('aside');
  el.className = 'right-sidebar';
  el.id = 'right-sidebar';

  el.innerHTML = `
    <!-- Search Box -->
    <div style="margin-bottom:16px;">
      <div class="input-with-icon">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input id="sidebar-search" class="input-field" placeholder="Search SocialNet..." type="search" aria-label="Search" style="height:42px;" />
      </div>
    </div>

    <!-- Trending -->
    <div class="trending-card" id="trending-card">
      <div class="trending-title">
        <span>Trending for you</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);cursor:pointer;" id="refresh-trending"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
      </div>
      <div id="trending-list">
        ${[1,2,3,4,5].map(() => `<div class="skeleton skeleton-text" style="margin-bottom:10px;"></div>`).join('')}
      </div>
      <button class="show-more-btn">Show More</button>
    </div>

    <!-- Who to Follow -->
    <div class="suggestions-card" id="suggestions-card">
      <div class="suggestions-title">Who to follow</div>
      <div id="suggestions-list">
        ${[1,2,3].map(() => `
          <div class="suggestion-item">
            <div class="skeleton skeleton-avatar"></div>
            <div style="flex:1;"><div class="skeleton skeleton-text" style="width:60%;"></div><div class="skeleton skeleton-text-sm"></div></div>
          </div>
        `).join('')}
      </div>
      <button class="show-more-btn" id="show-more-suggestions">Show More</button>
    </div>

    <!-- App Info -->
    <div style="padding:8px 4px;color:var(--text-muted);font-size:11px;line-height:1.8;">
      <a href="#" style="color:var(--text-muted);">Terms</a> ·
      <a href="#" style="color:var(--text-muted);">Privacy</a> ·
      <a href="#" style="color:var(--text-muted);">Help</a><br/>
      © 2024 SocialNet, Inc.
    </div>
  `;

  // Load trending
  loadTrending(el, navigate);

  // Load suggestions
  loadSuggestions(el, navigate);

  // Refresh trending
  el.querySelector('#refresh-trending')?.addEventListener('click', () => loadTrending(el, navigate));

  // Search
  const searchInput = el.querySelector('#sidebar-search');
  let timer;
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(timer);
      navigate('explore', { q: searchInput.value.trim() });
    }
  });

  return el;
}

async function loadTrending(el, navigate) {
  const list = el.querySelector('#trending-list');
  if (!list) return;
  try {
    const { trending } = await api.getTrending();
    list.innerHTML = trending.length ? trending.slice(0, 8).map((t, i) => `
      <div class="trending-item" data-tag="${t.tag}" role="button" tabindex="0">
        <div class="trending-category">TRENDING</div>
        <div class="trending-tag">#${t.tag}</div>
        <div class="trending-count">${formatCount(t.count)} posts</div>
      </div>
    `).join('') : '<p style="color:var(--text-secondary);font-size:13px;">No trending topics yet.</p>';

    list.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => navigate('explore', { q: item.dataset.tag }));
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate('explore', { q: item.dataset.tag }); });
    });
  } catch {
    list.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;">Failed to load trending.</p>';
  }
}

async function loadSuggestions(el, navigate) {
  const list = el.querySelector('#suggestions-list');
  if (!list) return;

  if (!isLoggedIn()) {
    list.innerHTML = `<p style="font-size:13px;color:var(--text-secondary);">Log in to see suggestions.</p>`;
    return;
  }

  try {
    const { users } = await api.getSuggestions();
    if (!users.length) {
      list.innerHTML = `<p style="font-size:13px;color:var(--text-secondary);">No suggestions right now.</p>`;
      return;
    }

    list.innerHTML = users.slice(0, 4).map(u => `
      <div class="suggestion-item" data-uid="${u.id}" role="button" tabindex="0" style="cursor:pointer;">
        <img src="${u.avatar}" alt="${u.displayName}" class="avatar avatar-sm"
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}'" />
        <div class="suggestion-info">
          <div class="suggestion-name">
            ${u.displayName}
            ${u.verified ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
          </div>
          <div class="suggestion-handle">@${u.username}</div>
        </div>
        <button class="btn btn-outline btn-sm follow-btn" data-uid="${u.id}" aria-label="Follow ${u.displayName}">Follow</button>
      </div>
    `).join('');

    // Follow buttons
    list.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!isLoggedIn()) { showToast('Please log in', 'error'); return; }
        btn.disabled = true;
        btn.textContent = '...';
        try {
          const result = await api.followUser(btn.dataset.uid);
          btn.textContent = result.following ? 'Following' : 'Follow';
          btn.classList.toggle('btn-primary', result.following);
          btn.classList.toggle('btn-outline', !result.following);
          showToast(result.following ? 'Now following!' : 'Unfollowed', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Click avatar/name → profile
    list.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('follow-btn') || e.target.closest('.follow-btn')) return;
        navigate('profile', { id: item.dataset.uid });
      });
    });
  } catch {
    list.innerHTML = `<p style="font-size:13px;color:var(--text-secondary);">Failed to load suggestions.</p>`;
  }
}
