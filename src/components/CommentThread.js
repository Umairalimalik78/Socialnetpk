// ── Comment Thread Component ────────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, isLoggedIn } from '../store.js';
import { timeAgo } from '../utils.js';
import { showToast } from './Toast.js';

export async function renderCommentThread(postId, container, navigate) {
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  let comments = [];
  try {
    const data = await api.getComments(postId);
    comments = data.comments || [];
  } catch {
    container.innerHTML = '<p style="padding:16px;color:var(--text-secondary);">Failed to load comments.</p>';
    return;
  }

  const user = getCurrentUser();

  container.innerHTML = `
    ${comments.length === 0 ? `
      <div style="padding:24px;text-align:center;color:var(--text-secondary);font-size:14px;">
        No comments yet. Be the first!
      </div>
    ` : comments.map(c => commentHTML(c)).join('')}

    ${isLoggedIn() ? `
      <div class="comment-input-row">
        <img src="${user?.avatar}" alt="${user?.displayName}" class="avatar avatar-sm"
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}'" />
        <input class="comment-input" id="comment-input-${postId}" placeholder="Write a comment..." type="text" maxlength="500" />
        <button class="btn btn-primary btn-sm" id="comment-submit-${postId}">Reply</button>
      </div>
    ` : `<p style="padding:12px 20px;font-size:13px;color:var(--text-secondary);">Log in to comment.</p>`}
  `;

  // Submit comment
  const input = container.querySelector(`#comment-input-${postId}`);
  const submitBtn = container.querySelector(`#comment-submit-${postId}`);

  const submit = async () => {
    const content = input?.value.trim();
    if (!content) return;
    submitBtn.disabled = true;
    submitBtn.textContent = '...';
    try {
      const { comment } = await api.addComment(postId, content);
      input.value = '';
      // Insert new comment at top of list
      const newEl = document.createElement('div');
      newEl.innerHTML = commentHTML(comment);
      container.insertBefore(newEl.firstChild, container.firstChild);
      // Update count on post card
      const countEl = document.querySelector(`#comment-btn-${postId} .comment-count`);
      if (countEl) {
        const cur = parseInt(countEl.textContent) || 0;
        countEl.textContent = cur + 1;
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reply';
    }
  };

  submitBtn?.addEventListener('click', submit);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
}

function commentHTML(c) {
  return `
    <div class="comment-item">
      <img src="${c.author?.avatar}" alt="${c.author?.displayName}" class="avatar avatar-sm"
           onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.username}'" />
      <div class="comment-body">
        <div class="comment-author">
          <span class="comment-author-name">${c.author?.displayName}</span>
          <span class="comment-author-handle">@${c.author?.username}</span>
          <span class="comment-time">· ${timeAgo(c.createdAt)}</span>
        </div>
        <div class="comment-content">${c.content}</div>
      </div>
    </div>
  `;
}
