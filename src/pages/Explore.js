// ── Explore / Search Page ─────────────────────────────────────────────────────
import { api } from '../api.js';
import { renderPostCard } from '../components/PostCard.js';
import { formatCount } from '../utils.js';
import { showToast } from '../components/Toast.js';
import { isLoggedIn } from '../store.js';

export async function renderExplorePage(container, navigate, params = {}) {
  container.className = 'main-content page-enter';

  container.innerHTML = `
    <!-- Header with Search -->
    <div class="explore-header">
      <h2 style="font-size:20px;font-weight:800;margin-bottom:12px;">Explore</h2>
      <div class="input-with-icon">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input class="input-field" id="explore-search-input" placeholder="Search people, posts, #hashtags..."
               type="search" value="${params.q || ''}" style="height:46px;font-size:15px;" aria-label="Search" />
      </div>
    </div>

    <!-- Trending Pills -->
    <div style="padding:16px 20px;border-bottom:1px solid var(--border-color);overflow-x:auto;display:flex;gap:8px;scrollbar-width:none;" id="trending-pills">
      <div class="skeleton" style="height:32px;width:90px;border-radius:999px;flex-shrink:0;"></div>
      <div class="skeleton" style="height:32px;width:110px;border-radius:999px;flex-shrink:0;"></div>
      <div class="skeleton" style="height:32px;width:80px;border-radius:999px;flex-shrink:0;"></div>
      <div class="skeleton" style="height:32px;width:100px;border-radius:999px;flex-shrink:0;"></div>
    </div>

    <!-- Results -->
    <div id="explore-results">
      <div class="loading-spinner"><div class="spinner"></div></div>
    </div>
  `;

  // Load trending pills
  try {
    const { trending } = await api.getTrending();
    const pillsEl = container.querySelector('#trending-pills');
    pillsEl.innerHTML = trending.slice(0, 10).map(t => `
      <button class="btn btn-outline btn-sm trending-pill" data-tag="${t.tag}" style="flex-shrink:0;border-radius:999px;">
        #${t.tag}
      </button>
    `).join('');
    pillsEl.querySelectorAll('.trending-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const input = container.querySelector('#explore-search-input');
        input.value = pill.dataset.tag;
        doSearch(pill.dataset.tag);
      });
    });
  } catch {}

  // Search function
  const resultsEl = container.querySelector('#explore-results');
  const input = container.querySelector('#explore-search-input');

  const doSearch = async (query) => {
    if (!query.trim()) {
      loadDefaultFeed();
      return;
    }
    resultsEl.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;
    try {
      const { users, posts } = await api.search(query);
      resultsEl.innerHTML = '';

      // Users section
      if (users.length > 0) {
        const section = document.createElement('div');
        section.className = 'search-results-section';
        section.innerHTML = `<div class="search-results-title">People</div>`;
        users.forEach(u => {
          const item = document.createElement('div');
          item.className = 'user-search-item';
          item.innerHTML = `
            <img src="${u.avatar}" alt="${u.displayName}" class="avatar avatar-md"
                 onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}'" />
            <div style="flex:1;">
              <div class="user-search-name" style="font-weight:600;font-size:14px;">${u.displayName}
                ${u.verified ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
              </div>
              <div style="font-size:12px;color:var(--text-secondary);">@${u.username} · ${formatCount(u.followersCount)} followers</div>
            </div>
            <button class="btn btn-outline btn-sm search-follow-btn" data-uid="${u.id}">
              ${u.isFollowing ? 'Following' : 'Follow'}
            </button>
          `;
          item.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-follow-btn') || e.target.closest('.search-follow-btn')) return;
            navigate('profile', { id: u.id });
          });
          section.appendChild(item);
        });
        // Follow buttons
        section.querySelectorAll('.search-follow-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!isLoggedIn()) { showToast('Please log in', 'error'); return; }
            btn.disabled = true;
            try {
              const result = await api.followUser(btn.dataset.uid);
              btn.textContent = result.following ? 'Following' : 'Follow';
              btn.className = `btn btn-sm ${result.following ? 'btn-primary' : 'btn-outline'} search-follow-btn`;
            } catch (err) {
              showToast(err.message, 'error');
            } finally {
              btn.disabled = false;
            }
          });
        });
        resultsEl.appendChild(section);
      }

      // Posts section
      if (posts.length > 0) {
        const postsSection = document.createElement('div');
        postsSection.innerHTML = `
          <div class="search-results-section">
            <div class="search-results-title">Posts</div>
          </div>
        `;
        resultsEl.appendChild(postsSection);
        posts.forEach(p => resultsEl.appendChild(renderPostCard(p, navigate)));
      }

      if (users.length === 0 && posts.length === 0) {
        resultsEl.innerHTML = `
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>No results for "${query}"</h3>
            <p>Try a different search term or hashtag.</p>
          </div>
        `;
      }
    } catch {
      resultsEl.innerHTML = `<div class="empty-state"><h3>Search failed</h3><p>Try again in a moment.</p></div>`;
    }
  };

  const loadDefaultFeed = async () => {
    resultsEl.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;
    try {
      const { posts } = await api.getFeed();
      resultsEl.innerHTML = `<div class="search-results-section"><div class="search-results-title">Discover</div></div>`;
      if (posts.length === 0) {
        resultsEl.innerHTML += `<div class="empty-state"><p>No posts to discover yet.</p></div>`;
      } else {
        posts.forEach(p => resultsEl.appendChild(renderPostCard(p, navigate)));
      }
    } catch {
      resultsEl.innerHTML = `<div class="empty-state"><h3>Couldn't load</h3><p>Make sure the server is running.</p></div>`;
    }
  };

  // Search on input with debounce
  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => doSearch(input.value.trim()), 400);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { clearTimeout(searchTimer); doSearch(input.value.trim()); }
  });

  // Initial search/load
  if (params.q) {
    doSearch(params.q);
  } else {
    loadDefaultFeed();
  }

  // Focus input
  setTimeout(() => input.focus(), 100);
}
