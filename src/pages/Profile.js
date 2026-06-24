// ── Profile Page ──────────────────────────────────────────────────────────────
import { api } from '../api.js';
import { getCurrentUser, isLoggedIn } from '../store.js';
import { renderPostCard } from '../components/PostCard.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { formatCount, verifiedBadge, skeletonPostCard } from '../utils.js';

export async function renderProfilePage(container, navigate, params = {}) {
  const me = getCurrentUser();
  const userId = params.id || me?.id;
  container.className = 'main-content page-enter';
  container.innerHTML = `<div class="loading-spinner" style="padding:60px;"><div class="spinner"></div></div>`;

  let user, posts, isFollowing = false;
  try {
    [{ user }, { posts }] = await Promise.all([
      api.getUser(userId),
      api.getUserPosts(userId),
    ]);
    isFollowing = user.isFollowing || false;
  } catch {
    container.innerHTML = `<div class="empty-state"><h3>User not found</h3><p>This profile doesn't exist.</p></div>`;
    return;
  }

  const isOwner = me?.id === user.id;

  container.innerHTML = `
    <!-- Cover Photo -->
    <div class="profile-cover" id="profile-cover">
      <img src="${user.coverPhoto}" alt="Cover" style="width:100%;height:100%;object-fit:cover;"
           onerror="this.style.display='none'" />
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar-row">
        <div style="position:relative;">
          <img src="${user.avatar}" alt="${user.displayName}" class="profile-avatar"
               onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}'" />
          ${isOwner ? `<button class="btn btn-ghost btn-sm" id="change-avatar-btn" style="position:absolute;bottom:0;right:-8px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:50%;width:28px;height:28px;padding:0;" title="Change avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </button>` : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${isOwner
            ? `<button class="btn btn-outline" id="edit-profile-btn">Edit Profile</button>`
            : `
              <button class="btn ${isFollowing ? 'btn-outline' : 'btn-primary'}" id="follow-btn">
                ${isFollowing ? 'Following' : 'Follow'}
              </button>
              <button class="btn btn-outline" id="friend-req-btn" title="Send friend request">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
              </button>
            `
          }
        </div>
      </div>

      <h1 class="profile-name">
        ${user.displayName}
        ${user.verified ? verifiedBadge() : ''}
      </h1>
      <div class="profile-username">@${user.username}</div>
      ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}

      <div class="profile-meta">
        ${user.location ? `<span class="profile-meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${user.location}
        </span>` : ''}
        ${user.website ? `<span class="profile-meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <a href="${user.website}" target="_blank" rel="noopener" style="color:var(--accent-blue);">${user.website.replace(/^https?:\/\//, '')}</a>
        </span>` : ''}
        <span class="profile-meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <span class="profile-stat-value">${formatCount(user.followingCount)}</span>
          <span class="profile-stat-label">Following</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-value">${formatCount(user.followersCount)}</span>
          <span class="profile-stat-label">Followers</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-value">${formatCount(posts.length)}</span>
          <span class="profile-stat-label">Posts</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-nav">
      <button class="tab-nav-item active" data-tab="posts">Posts</button>
      <button class="tab-nav-item" data-tab="media">Media</button>
      <button class="tab-nav-item" data-tab="likes">Likes</button>
    </div>

    <!-- Posts -->
    <div id="profile-posts-list">
      ${posts.length === 0 ? `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <h3>No posts yet</h3>
          <p>${isOwner ? 'Share your first thought!' : `${user.displayName} hasn't posted yet.`}</p>
        </div>
      ` : ''}
    </div>
  `;

  // Render posts
  const postsList = container.querySelector('#profile-posts-list');
  posts.forEach(p => postsList.appendChild(renderPostCard(p, navigate)));

  // Tab switching
  const allPosts = posts;
  container.querySelectorAll('.tab-nav-item').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab-nav-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.tab;
      postsList.innerHTML = '';

      const filtered = type === 'media'
        ? allPosts.filter(p => p.image || p.video)
        : allPosts;

      if (filtered.length === 0) {
        postsList.innerHTML = `<div class="empty-state"><p>No ${type} yet.</p></div>`;
      } else {
        filtered.forEach(p => postsList.appendChild(renderPostCard(p, navigate)));
      }
    });
  });

  // Follow button
  const followBtn = container.querySelector('#follow-btn');
  followBtn?.addEventListener('click', async () => {
    if (!isLoggedIn()) { showToast('Please log in first', 'error'); return; }
    followBtn.disabled = true;
    try {
      const result = await api.followUser(user.id);
      isFollowing = result.following;
      followBtn.textContent = isFollowing ? 'Following' : 'Follow';
      followBtn.className = `btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`;
      // Update counts
      const followersStatEl = container.querySelectorAll('.profile-stat-value')[1];
      if (followersStatEl) {
        user.followersCount += isFollowing ? 1 : -1;
        followersStatEl.textContent = formatCount(user.followersCount);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      followBtn.disabled = false;
    }
  });

  // Friend request
  container.querySelector('#friend-req-btn')?.addEventListener('click', async () => {
    if (!isLoggedIn()) { showToast('Please log in first', 'error'); return; }
    try {
      await api.sendFriendRequest(user.id);
      showToast(`Friend request sent to ${user.displayName}! 👋`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Edit Profile modal
  container.querySelector('#edit-profile-btn')?.addEventListener('click', () => {
    openModal({
      title: 'Edit Profile',
      content: `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="input-group">
            <label class="input-label">Display Name</label>
            <input class="input-field" id="edit-displayname" value="${user.displayName || ''}" />
          </div>
          <div class="input-group">
            <label class="input-label">Bio</label>
            <textarea class="input-field" id="edit-bio" rows="3" style="resize:vertical;">${user.bio || ''}</textarea>
          </div>
          <div class="input-group">
            <label class="input-label">Location</label>
            <input class="input-field" id="edit-location" value="${user.location || ''}" placeholder="City, Country" />
          </div>
          <div class="input-group">
            <label class="input-label">Website</label>
            <input class="input-field" id="edit-website" value="${user.website || ''}" placeholder="https://yoursite.com" />
          </div>
          <div class="input-group">
            <label class="input-label">Default Post Privacy</label>
            <select class="input-field" id="edit-privacy">
              <option value="public" ${user.privacy === 'public' ? 'selected' : ''}>🌍 Public</option>
              <option value="friends" ${user.privacy === 'friends' ? 'selected' : ''}>👥 Friends Only</option>
              <option value="private" ${user.privacy === 'private' ? 'selected' : ''}>🔒 Private</option>
            </select>
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-ghost" id="cancel-edit">Cancel</button>
        <button class="btn btn-gradient" id="save-edit">Save Changes</button>
      `,
    });

    setTimeout(() => {
      document.getElementById('cancel-edit')?.addEventListener('click', closeModal);
      document.getElementById('save-edit')?.addEventListener('click', async () => {
        const updates = {
          displayName: document.getElementById('edit-displayname').value.trim(),
          bio: document.getElementById('edit-bio').value.trim(),
          location: document.getElementById('edit-location').value.trim(),
          website: document.getElementById('edit-website').value.trim(),
          privacy: document.getElementById('edit-privacy').value,
        };
        try {
          const { user: updated } = await api.updateUser(me.id, updates);
          // Update localStorage user
          const stored = JSON.parse(localStorage.getItem('sn_user') || '{}');
          localStorage.setItem('sn_user', JSON.stringify({ ...stored, ...updates }));
          closeModal();
          showToast('Profile updated! ✨', 'success');
          renderProfilePage(container, navigate, { id: me.id });
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }, 50);
  });
}
