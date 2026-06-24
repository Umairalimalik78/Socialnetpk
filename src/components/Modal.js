// ── Modal Component ───────────────────────────────────────────────────────────
const overlay = () => document.getElementById('modal-overlay');

export function openModal({ title, content, footer = '' }) {
  const o = overlay();
  o.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close-btn" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body"></div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;
  const body = o.querySelector('.modal-body');
  if (content instanceof HTMLElement) {
    body.appendChild(content);
  } else {
    body.innerHTML = content || '';
  }
  o.classList.add('open');
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  o.addEventListener('click', (e) => { if (e.target === o) closeModal(); });
  document.addEventListener('keydown', handleEsc);
}

export function closeModal() {
  const o = overlay();
  o.classList.remove('open');
  o.innerHTML = '';
  document.removeEventListener('keydown', handleEsc);
}

function handleEsc(e) {
  if (e.key === 'Escape') closeModal();
}

export function confirmModal(title, message) {
  return new Promise((resolve) => {
    openModal({
      title,
      content: `<p>${message}</p>`,
      footer: `
        <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok">Confirm</button>
      `,
    });
    setTimeout(() => {
      document.getElementById('confirm-cancel')?.addEventListener('click', () => { closeModal(); resolve(false); });
      document.getElementById('confirm-ok')?.addEventListener('click', () => { closeModal(); resolve(true); });
    }, 0);
  });
}
