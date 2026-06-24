// ── Post Composer ────────────────────────────────────────────────────────────
import { getCurrentUser, isLoggedIn } from '../store.js';
import { api } from '../api.js';
import { showToast } from './Toast.js';

const MAX_CHARS = 280;

export function renderPostComposer(onPostCreated) {
  const user = getCurrentUser();
  const el = document.createElement('div');
  el.className = 'post-composer';
  el.id = 'post-composer';

  el.innerHTML = `
    <div class="composer-header">
      <img src="${user?.avatar}" alt="${user?.displayName}" class="avatar avatar-md"
           onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}'" />
      <div class="composer-body">
        <div class="composer-type-tabs">
          <div class="composer-tabs-list">
            <button class="composer-tab active" data-type="post" id="tab-post">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
              Post
            </button>
            <button class="composer-tab" data-type="photo" id="tab-photo">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Photo
            </button>
            <button class="composer-tab" data-type="video" id="tab-video">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              Video
            </button>
          </div>
          <select class="composer-privacy-select" id="composer-privacy">
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends Only</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        <textarea
          class="composer-textarea"
          id="post-composer-textarea"
          placeholder="What's on your mind?"
          rows="3"
          maxlength="${MAX_CHARS}"
          aria-label="Compose post"
        ></textarea>

        <div id="composer-image-preview" class="composer-image-preview" style="display:none;"></div>
        <div id="composer-video-url-input" style="display:none;margin-top:8px;">
          <input class="input-field" id="video-url-input" placeholder="Paste video URL (YouTube, Vimeo...)" style="font-size:13px;" />
        </div>

        <div class="composer-footer">
          <div class="composer-actions">
            <button class="composer-action-btn" id="composer-image-btn" title="Add photo" aria-label="Add photo">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>
            <button class="composer-action-btn" id="composer-emoji-btn" title="Add emoji" aria-label="Add emoji">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </button>
            <span class="char-count" id="char-count">0 / ${MAX_CHARS}</span>
          </div>
          <button class="btn btn-gradient" id="compose-submit-btn" disabled>Post</button>
        </div>
      </div>
    </div>
    <input type="file" id="image-file-input" accept="image/*" style="display:none;" aria-label="Upload image" />
  `;

  // ── State ─────────────────────────────────────────────────────────────────
  let imageData = null;
  let videoUrl = null;

  const textarea = el.querySelector('#post-composer-textarea');
  const submitBtn = el.querySelector('#compose-submit-btn');
  const charCount = el.querySelector('#char-count');
  const imagePreview = el.querySelector('#composer-image-preview');
  const fileInput = el.querySelector('#image-file-input');

  // Char count
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.className = 'char-count' + (len > 260 ? ' danger' : len > 240 ? ' warning' : '');
    submitBtn.disabled = len === 0 && !imageData;
  });

  // Image upload
  el.querySelector('#composer-image-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageData = ev.target.result;
      imagePreview.style.display = 'block';
      imagePreview.innerHTML = `
        <img src="${imageData}" alt="Preview" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;" />
        <button class="remove-image" id="remove-image-btn" aria-label="Remove image">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;
      el.querySelector('#remove-image-btn').addEventListener('click', () => {
        imageData = null;
        imagePreview.style.display = 'none';
        fileInput.value = '';
      });
      submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  // Tabs
  el.querySelectorAll('.composer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.composer-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.type;
      el.querySelector('#composer-video-url-input').style.display = type === 'video' ? 'block' : 'none';
      if (type === 'photo') fileInput.click();
    });
  });

  // Emoji (simple picker)
  const EMOJIS = ['😀','😂','❤️','🔥','👍','🎉','😍','🙌','✨','💡','🚀','😎','🤔','😊','🎨','💪','🌟','🙏','😭','😅'];
  el.querySelector('#composer-emoji-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    let picker = document.getElementById('emoji-picker');
    if (picker) { picker.remove(); return; }
    picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.style.cssText = 'position:absolute;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px;padding:10px;display:flex;flex-wrap:wrap;gap:6px;z-index:200;box-shadow:var(--shadow-lg);max-width:240px;';
    EMOJIS.forEach(em => {
      const btn = document.createElement('button');
      btn.textContent = em;
      btn.style.cssText = 'background:none;border:none;font-size:20px;cursor:pointer;padding:4px;border-radius:6px;transition:background 0.1s;';
      btn.onmouseenter = () => btn.style.background = 'var(--bg-hover)';
      btn.onmouseleave = () => btn.style.background = 'none';
      btn.onclick = () => {
        const pos = textarea.selectionStart;
        textarea.value = textarea.value.slice(0, pos) + em + textarea.value.slice(pos);
        textarea.selectionStart = textarea.selectionEnd = pos + em.length;
        textarea.dispatchEvent(new Event('input'));
        picker.remove();
      };
      picker.appendChild(btn);
    });
    el.querySelector('.composer-actions').style.position = 'relative';
    el.querySelector('.composer-actions').appendChild(picker);
    setTimeout(() => document.addEventListener('click', () => picker.remove(), { once: true }), 0);
  });

  // Submit
  submitBtn.addEventListener('click', async () => {
    const content = textarea.value.trim();
    if (!content && !imageData) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    try {
      const privacy = el.querySelector('#composer-privacy').value;
      const vidUrl = el.querySelector('#video-url-input')?.value.trim();
      const { post } = await api.createPost({
        content,
        image: imageData || null,
        video: vidUrl || null,
        privacy,
      });

      // Reset composer
      textarea.value = '';
      imageData = null;
      imagePreview.style.display = 'none';
      fileInput.value = '';
      charCount.textContent = `0 / ${MAX_CHARS}`;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Post';

      showToast('Post published! 🎉', 'success');
      if (onPostCreated) onPostCreated(post);
    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  });

  return el;
}
