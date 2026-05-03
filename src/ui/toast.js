const DEFAULT_TIMEOUT = 4200;
const MAX_TOASTS = 4;
let toastRoot = null;
let initialized = false;
let offlineToastShown = false;

function ensureToastRoot() {
  if (toastRoot) return toastRoot;

  toastRoot = document.getElementById('toastRoot');
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toastRoot';
    toastRoot.className = 'toastRoot';
    toastRoot.setAttribute('aria-live', 'polite');
    toastRoot.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(toastRoot);
  }

  return toastRoot;
}

function normalizeType(type) {
  return ['success', 'warning', 'error', 'info'].includes(type) ? type : 'info';
}

function removeToast(toast) {
  if (!toast || toast.dataset.removing === 'true') return;
  toast.dataset.removing = 'true';
  toast.classList.add('is-leaving');
  window.setTimeout(() => toast.remove(), 180);
}

export function showToast(message, { type = 'info', timeout = DEFAULT_TIMEOUT, actionLabel = '', onAction = null } = {}) {
  const text = String(message || '').trim();
  if (!text) return null;

  const root = ensureToastRoot();
  while (root.children.length >= MAX_TOASTS) {
    root.firstElementChild?.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${normalizeType(type)}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const body = document.createElement('div');
  body.className = 'toastBody';
  body.textContent = text;
  toast.appendChild(body);

  if (actionLabel && typeof onAction === 'function') {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'toastAction';
    action.textContent = actionLabel;
    action.addEventListener('click', () => {
      onAction();
      removeToast(toast);
    });
    toast.appendChild(action);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toastClose';
  close.setAttribute('aria-label', 'Đóng thông báo');
  close.textContent = '×';
  close.addEventListener('click', () => removeToast(toast));
  toast.appendChild(close);

  root.appendChild(toast);

  if (timeout > 0) {
    window.setTimeout(() => removeToast(toast), timeout);
  }

  return toast;
}

export function setInlineStatus(selector, message, type = 'info') {
  const target = document.querySelector(selector);
  if (!target) return;
  target.textContent = String(message || '');
  target.classList.toggle('is-error', type === 'error');
  target.classList.toggle('is-success', type === 'success');
  target.classList.toggle('is-warning', type === 'warning');
}

export function initFeedbackSystem() {
  if (initialized) return;
  initialized = true;
  ensureToastRoot();

  window.addEventListener('online', () => {
    offlineToastShown = false;
    showToast('Đã kết nối lại mạng.', { type: 'success', timeout: 2600 });
  });

  window.addEventListener('offline', () => {
    if (offlineToastShown) return;
    offlineToastShown = true;
    showToast('Bạn đang offline. Ứng dụng vẫn dùng được nếu dữ liệu đã được lưu trong bộ nhớ đệm.', {
      type: 'warning',
      timeout: 7000
    });
  });

  if (navigator.onLine === false) {
    offlineToastShown = true;
    window.setTimeout(() => {
      showToast('Bạn đang offline. Nếu dữ liệu mặc định chưa được lưu, hãy nạp JSON thủ công.', {
        type: 'warning',
        timeout: 7000
      });
    }, 400);
  }
}
