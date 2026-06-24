// ── Post Card Component ────────────────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, isLoggedIn } from '../store.js';
import { timeAgo, formatCount, linkifyContent, verifiedBadge, privacyIcon } from '../utils.js';
import { showToast } from './Toast.js';
import { confirmModal } from './Modal.js';
import { renderCommentThread } from './CommentThread.js';

export function renderPostCard(post, navigate) {
  const user = getCurrentUser();
  const isOwner = user?.id === post.authorId;
  const el = document.createElement('article');
  el.className = 'post-card';
  el.dataset.postId = post.id;

  el.innerHTML = `
    <div class="post-card-header">
      <img
        src="${post.author?.avatar}"
        alt="${post.author?.displayName}"
        class="avatar avatar-md"
        style="cursor:pointer;"
        id="post-avatar-${post.id}"
        onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}'"
      />
      <div class="post-author-info">
        <div class="post-author-row">
          <span class="post-author-name" style="cursor:pointer;" id="post-name-${post.id}">
            ${post.author?.displayName}
            ${post.author?.verified ? verifiedBadge() : ''}
          </span>
          <span class="post-author-handle">@${post.author?.username}</span>
          <span class="post-timestamp">· ${timeAgo(post.createdAt)}</span>
          <span class="privacy-badge" title="${post.privacy}">${privacyIcon(post.privacy)} ${post.privacy}</span>
        </div>
      </div>
      <button class="post-menu-btn" id="post-menu-${post.id}" aria-label="Post options">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      </button>
    </div>

    <div class="post-content" id="post-content-${post.id}">${linkifyContent(post.content)}</div>

    ${post.image ? `
      <div class="post-image">
        <img src="${post.image}" alt="Post image" loading="lazy" onerror="this.parentElement.style.display='none'" />
      </div>
    ` : ''}

    <div class="post-actions">
      <button class="post-action-btn like-btn ${post.liked ? 'liked' : ''}" id="like-btn-${post.id}" aria-label="Like post" aria-pressed="${post.liked}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <span class="like-count">${formatCount(post.likesCount)}</span>
      </button>

      <button class="post-action-btn comment-toggle-btn" id="comment-btn-${post.id}" aria-label="Comments">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span class="comment-count">${formatCount(post.commentsCount)}</span>
      </button>

      <button class="post-action-btn share-btn" id="share-btn-${post.id}" aria-label="Share">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>${formatCount(post.sharesCount)}</span>
      </button>

      ${isOwner ? `
        <button class="post-action-btn" id="delete-btn-${post.id}" aria-label="Delete post" style="color:var(--accent-red);margin-left:auto;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
        </button>
      ` : ''}
    </div>

    <!-- Comments Section (toggled) -->
    <div class="comments-section" id="comments-section-${post.id}" style="display:none;"></div>
  `;

  // ── Event listeners ────────────────────────────────────────────────────────
  // Author click → profile
  [el.querySelector(`#post-avatar-${post.id}`), el.querySelector(`#post-name-${post.id}`)].forEach(el2 => {
    el2?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate('profile', { id: post.authorId });
    });
  });

  // Hashtag click
  el.querySelectorAll('.hashtag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate('explore', { q: tag.dataset.tag });
    });
  });

  // Like
  el.querySelector(`#like-btn-${post.id}`)?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { showToast('Please log in to like posts', 'error'); return; }
    const btn = e.currentTarget;
    const liked = btn.classList.contains('liked');
    const countEl = btn.querySelector('.like-count');
    const svg = btn.querySelector('svg');
    const current = post.likesCount;

    // Optimistic update
    if (liked) {
      btn.classList.remove('liked');
      svg.setAttribute('fill', 'none');
      post.liked = false;
      post.likesCount = Math.max(0, current - 1);
    } else {
      btn.classList.add('liked', 'animating');
      svg.setAttribute('fill', 'currentColor');
      post.liked = true;
      post.likesCount = current + 1;
      setTimeout(() => btn.classList.remove('animating'), 400);
    }
    countEl.textContent = formatCount(post.likesCount);
    btn.setAttribute('aria-pressed', String(post.liked));

    try {
      const result = await api.likePost(post.id);
      post.likesCount = result.count;
      countEl.textContent = formatCount(result.count);
    } catch {
      // revert
      post.liked = liked;
      post.likesCount = current;
      btn.classList.toggle('liked', liked);
      svg.setAttribute('fill', liked ? 'currentColor' : 'none');
      countEl.textContent = formatCount(current);
    }
  });

  // Comments toggle
  el.querySelector(`#comment-btn-${post.id}`)?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const section = el.querySelector(`#comments-section-${post.id}`);
    if (!section) return;
    if (section.style.display === 'none') {
      section.style.display = 'block';
      await renderCommentThread(post.id, section, navigate);
    } else {
      section.style.display = 'none';
    }
  });

  // Share → copy link
  el.querySelector(`#share-btn-${post.id}`)?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}#/post/${post.id}`).catch(() => {});
    post.sharesCount++;
    e.currentTarget.querySelector('span').textContent = formatCount(post.sharesCount);
    showToast('Link copied to clipboard!', 'success');
  });

  // Delete
  el.querySelector(`#delete-btn-${post.id}`)?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const ok = await confirmModal('Delete Post', 'Are you sure you want to delete this post? This action cannot be undone.');
    if (!ok) return;
    try {
      await api.deletePost(post.id);
      el.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
      showToast('Post deleted.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  return el;
}
