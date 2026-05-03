window.__SHIME_MAIN_ENTRY_LOADED = true;
window.__SHIME_MAIN_IMPORT_ERROR = null;
window.__SHIME_BOOT_RUNTIME_ERROR = null;
window.__SHIME_BOOT_STATUS = 'main-entry-loaded';
window.dispatchEvent(new CustomEvent('shime-main-entry-loaded'));

function serializeBootError(error, source = 'unknown') {
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack || '',
    source,
    mainScript: 'src/main.js',
    location: window.location.href,
    userAgent: navigator.userAgent
  };
}

function rememberRuntimeError(error, source) {
  if (window.__SHIME_MAIN_MODULE_LOADED) return;
  window.__SHIME_BOOT_RUNTIME_ERROR = serializeBootError(error, source);
}

window.addEventListener('error', event => {
  rememberRuntimeError(event.error || event.message || 'window error before main module completed', 'window-error');
});

window.addEventListener('unhandledrejection', event => {
  rememberRuntimeError(event.reason || 'unhandled rejection before main module completed', 'unhandledrejection');
});

function setMainModuleFailure(error) {
  const diagnostics = serializeBootError(error, 'dynamic-import');
  window.__SHIME_MAIN_IMPORT_ERROR = diagnostics;
  window.__SHIME_BOOT_STATUS = 'main-module-import-failed';
  console.error('[ShimeChamhoc main entry] Failed to import src/main.js', error, diagnostics);

  const status = document.getElementById('statusMessage');
  if (status && (!status.textContent || status.textContent.trim() === 'Đang chờ dữ liệu...')) {
    status.textContent = 'Không tải được module chính. Hãy xóa cache PWA hoặc tải lại trang.';
  }

  window.dispatchEvent(new CustomEvent('shime-main-module-import-failed', { detail: diagnostics }));
}

import('./main.js').catch(setMainModuleFailure);
