// ── Home Feed Page ────────────────────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, getState, setState } from '../store.js';
import { renderPostComposer } from '../components/PostComposer.js';
import { renderPostCard } from '../components/PostCard.js';
import { onWsEvent } from '../socket.js';
import { skeletonPostCard } from '../utils.js';

export async function renderHomePage(container, navigate) {
  container.innerHTML = '';
  container.className = 'main-content page-enter';

  // Header
  const header = document.createElement('div');
  header.className = 'feed-header';
  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h2>Home</h2>
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="width:8px;height:8px;background:var(--accent-green);border-radius:50%;animation:pulse 2s infinite;"></div>
        <span style="font-size:13px;color:var(--text-secondary);">Live</span>
      </div>
    </div>
  `;
  container.appendChild(header);

  // Post Composer
  const composer = renderPostComposer((newPost) => {
    // Prepend new post to feed immediately
    setState('pendingNewPosts', []);
    prependPost(newPost);
  });
  container.appendChild(composer);

  // New posts banner (WebSocket)
  const banner = document.createElement('button');
  banner.className = 'new-posts-banner';
  banner.style.display = 'none';
  banner.id = 'new-posts-banner';
  container.appendChild(banner);

  // Feed list
  const feedList = document.createElement('div');
  feedList.id = 'feed-list';
  feedList.innerHTML = [1,2,3,4].map(skeletonPostCard).join('');
  container.appendChild(feedList);

  // Load feed
  let posts = [];
  try {
    const data = await api.getFeed();
    posts = data.posts || [];
    feedList.innerHTML = '';
    if (posts.length === 0) {
      feedList.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <h3>No posts yet</h3>
          <p>Be the first to post something!</p>
        </div>
      `;
    } else {
      posts.forEach(p => feedList.appendChild(renderPostCard(p, navigate)));
    }
  } catch (err) {
    feedList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3>Couldn't load feed</h3>
        <p>Make sure the server is running on port 3001.</p>
        <button class="btn btn-primary" id="retry-feed" style="margin-top:16px;">Retry</button>
      </div>
    `;
    feedList.querySelector('#retry-feed')?.addEventListener('click', () => renderHomePage(container, navigate));
  }

  // ── WebSocket: incoming new posts ─────────────────────────────────────────
  let pendingCount = 0;
  const unsubNewPost = onWsEvent('new_post', (msg) => {
    pendingCount++;
    banner.style.display = 'block';
    banner.textContent = `↑ ${pendingCount} new post${pendingCount > 1 ? 's' : ''} — Click to refresh`;
    banner.setAttribute('aria-live', 'polite');
  });

  banner.addEventListener('click', async () => {
    banner.style.display = 'none';
    pendingCount = 0;
    const data = await api.getFeed().catch(() => ({ posts: [] }));
    feedList.innerHTML = '';
    (data.posts || []).forEach(p => feedList.appendChild(renderPostCard(p, navigate)));
  });

  // ── Infinite scroll ───────────────────────────────────────────────────────
  let loading = false;
  let hasMore = posts.length >= 20;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    loading = true;
    const lastPost = feedList.lastElementChild?.dataset?.postId;
    if (!lastPost) { loading = false; return; }

    const sentinel = document.createElement('div');
    sentinel.innerHTML = skeletonPostCard();
    feedList.appendChild(sentinel);

    try {
      const oldest = posts[posts.length - 1]?.createdAt;
      const data = await api.getFeed(oldest);
      const newPosts = data.posts || [];
      sentinel.remove();
      if (newPosts.length === 0) { hasMore = false; }
      else {
        newPosts.forEach(p => { posts.push(p); feedList.appendChild(renderPostCard(p, navigate)); });
      }
    } catch {
      sentinel.remove();
    }
    loading = false;
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });

  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  feedList.after(sentinel);
  observer.observe(sentinel);

  // Cleanup on navigate away
  container._cleanup = () => {
    unsubNewPost();
    observer.disconnect();
  };

  function prependPost(post) {
    const card = renderPostCard(post, navigate);
    feedList.prepend(card);
    posts.unshift(post);
  }
}
