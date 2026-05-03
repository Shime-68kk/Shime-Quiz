(function () {
  'use strict';

  var BOOT_TIMEOUT_MS = 9500;
  var HANDOFF_RETRY_INTERVAL_MS = 500;
  var HANDOFF_RETRY_TIMEOUT_MS = 10000;
  var WAITING_TEXT = 'Đang chờ dữ liệu...';
  var FALLBACK_MESSAGE = 'Ứng dụng chưa khởi động hoàn tất. Hãy thử tải lại hoặc nạp JSON thủ công.';
  var MAIN_MODULE_LOAD_FAILURE_MESSAGE = 'Không tải được module chính. Hãy xóa cache PWA hoặc tải lại trang.';
  var THEME_KEY = 'theme';
  var handoffRetryTimer = null;
  var handoffRetryStartedAt = 0;

  window.__SHIME_BOOT_GUARD_LOADED = true;
  window.__SHIME_APP_READY = Boolean(window.__SHIME_APP_READY);
  window.__SHIME_MAIN_MODULE_LOADED = Boolean(window.__SHIME_MAIN_MODULE_LOADED);
  window.__SHIME_CRITICAL_CONTROLS_READY = Boolean(window.__SHIME_CRITICAL_CONTROLS_READY);

  function get(id) {
    return document.getElementById(id);
  }

  function setStatus(message) {
    var status = get('statusMessage');
    if (status) status.textContent = message;
  }

  function isStillWaiting() {
    var status = get('statusMessage');
    return !status || !status.textContent || status.textContent.trim() === WAITING_TEXT;
  }

  function getDiagnostics(reason) {
    return {
      reason: reason,
      mainEntryLoaded: Boolean(window.__SHIME_MAIN_ENTRY_LOADED),
      mainModuleLoaded: Boolean(window.__SHIME_MAIN_MODULE_LOADED),
      mainImportError: window.__SHIME_MAIN_IMPORT_ERROR || null,
      bootRuntimeError: window.__SHIME_BOOT_RUNTIME_ERROR || null,
      appReady: Boolean(window.__SHIME_APP_READY),
      criticalControlsReady: Boolean(window.__SHIME_CRITICAL_CONTROLS_READY),
      bootStatus: window.__SHIME_BOOT_STATUS || '',
      online: navigator.onLine,
      serviceWorkerController: Boolean(navigator.serviceWorker && navigator.serviceWorker.controller),
      currentScript: 'src/boot-guard.js',
      mainScript: 'src/main.js',
      location: window.location.href
    };
  }

  function reportBootProblem(reason) {
    var diagnostics = getDiagnostics(reason);
    var message = diagnostics.mainModuleLoaded ? FALLBACK_MESSAGE : MAIN_MODULE_LOAD_FAILURE_MESSAGE;
    if (!diagnostics.mainEntryLoaded) message = 'Không tải được điểm vào ứng dụng. Hãy xóa cache PWA hoặc tải lại trang.';
    console.error('[ShimeChamhoc boot guard]', message, diagnostics);
    if (isStillWaiting()) setStatus(message);
    window.dispatchEvent(new CustomEvent('shime-boot-timeout', { detail: diagnostics }));
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }

  function toggleThemeFallback() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initThemeFallback() {
    try {
      setTheme(localStorage.getItem(THEME_KEY) || 'dark');
    } catch (_) {
      setTheme('dark');
    }
  }

  function openTextbookImporterFallback() {
    var modal = get('importerModal');
    if (!modal) {
      setStatus('Không tìm thấy trình nhập giáo trình. Hãy tải lại trang rồi thử lại.');
      return;
    }
    modal.style.display = 'flex';
    var report = get('importerReport');
    if (report) {
      report.textContent = window.__SHIME_CRITICAL_CONTROLS_READY
        ? '👉 Dán nội dung hoặc chọn file, rồi bấm Xem trước.'
        : 'Trình nhập đang mở ở chế độ khôi phục. Nếu nút xử lý chưa hoạt động, hãy tải lại trang hoặc nạp JSON thủ công.';
    }
    (get('textbookArea') || get('btnChooseTextbookFile') || modal).focus?.({ preventScroll: true });
  }

  function closeTextbookImporterFallback() {
    var modal = get('importerModal');
    if (modal) modal.style.display = 'none';
  }

  function triggerTextbookInputFallback() {
    var input = get('textbookInput');
    if (input instanceof HTMLInputElement) {
      input.value = '';
      input.click();
      return;
    }
    setStatus('Không tìm thấy ô chọn file giáo trình. Hãy tải lại trang rồi thử lại.');
  }

  function showHelpFallback() {
    if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
    setStatus('Hướng dẫn chưa sẵn sàng vì ứng dụng chưa khởi động hoàn tất. Bạn vẫn có thể nạp JSON thủ công.');
  }

  function triggerInput(input) {
    input.value = '';
    input.click();
  }

  function handleLabelKeyboard(labelId, inputId) {
    var label = get(labelId);
    var input = get(inputId);
    if (!label || !(input instanceof HTMLInputElement) || label.dataset.bootKeyBound === '1') return;
    label.dataset.bootKeyBound = '1';
    label.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      triggerInput(input);
    });
  }

  function bindJsonFallbackAction(labelId, inputId) {
    var label = get(labelId);
    var input = get(inputId);
    if (!label || !(input instanceof HTMLInputElement) || label.dataset.bootJsonClickBound === '1') return;
    label.dataset.bootJsonClickBound = '1';
    label.addEventListener('click', function (event) {
      if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
      event.preventDefault();
      triggerInput(input);
      var menu = get('toolMenu');
      var tools = get('btnTools');
      if (menu) menu.classList.remove('show');
      if (tools) tools.setAttribute('aria-expanded', 'false');
    });
  }

  function bindButton(id, handler) {
    var button = get(id);
    if (!button || button.dataset.bootGuardBound === '1') return;
    button.dataset.bootGuardBound = '1';
    button.addEventListener('click', function (event) {
      if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
      handler(event);
    });
  }

  function bindMobileMenuFallback() {
    var button = get('btnTools');
    var menu = get('toolMenu');
    if (!button || !menu || button.dataset.bootMenuBound === '1') return;
    button.dataset.bootMenuBound = '1';

    function setOpen(open) {
      menu.classList.toggle('show', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    button.addEventListener('click', function (event) {
      if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
      event.stopPropagation();
      setOpen(!menu.classList.contains('show'));
    });

    document.addEventListener('click', function (event) {
      if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
      if (!menu.contains(event.target) && event.target !== button) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (window.__SHIME_CRITICAL_CONTROLS_READY) return;
      if (event.key === 'Escape' && menu.classList.contains('show')) {
        event.preventDefault();
        setOpen(false);
        button.focus({ preventScroll: true });
      }
    });
  }


  function clearHandoffRetry() {
    if (handoffRetryTimer) window.clearInterval(handoffRetryTimer);
    handoffRetryTimer = null;
    handoffRetryStartedAt = 0;
  }

  function tryPendingJsonHandoff(reason) {
    var pending = window.__SHIME_BOOT_PENDING_JSON;
    if (!pending || typeof window.__SHIME_LOAD_JSON_DATA !== 'function') return false;

    try {
      var sourceLabel = pending.name || pending.sourceLabel || 'file JSON khôi phục';
      var payload = pending.text || (pending.data != null ? JSON.stringify(pending.data) : '');
      var loaded = window.__SHIME_LOAD_JSON_DATA(payload, sourceLabel);
      if (loaded) {
        window.__SHIME_BOOT_PENDING_JSON = null;
        clearHandoffRetry();
        return true;
      }
    } catch (error) {
      console.error('[ShimeChamhoc boot guard] Pending JSON handoff failed:', error);
    }

    return false;
  }

  function schedulePendingJsonHandoffRetry() {
    if (handoffRetryTimer) return;
    handoffRetryStartedAt = Date.now();

    handoffRetryTimer = window.setInterval(function () {
      if (tryPendingJsonHandoff('retry')) return;

      if (Date.now() - handoffRetryStartedAt >= HANDOFF_RETRY_TIMEOUT_MS) {
        clearHandoffRetry();
        if (!window.__SHIME_APP_READY) {
          setStatus('Đã chọn file JSON hợp lệ, nhưng ứng dụng chưa khởi động hoàn tất. Hãy tải lại trang; nếu lỗi lặp lại, hãy xóa cache PWA.');
          console.error('[ShimeChamhoc boot guard] Main JSON loader was not available before handoff timeout.', getDiagnostics('pending-json-handoff-timeout'));
        }
      }
    }, HANDOFF_RETRY_INTERVAL_MS);
  }

  function bindFallbackToolbar() {
    handleLabelKeyboard('btnLoadJson', 'fileInput');
    handleLabelKeyboard('mLoadJson', 'fileInput');
    bindJsonFallbackAction('btnLoadJson', 'fileInput');
    bindJsonFallbackAction('mLoadJson', 'fileInput');
    bindButton('btnLoadTextbook', openTextbookImporterFallback);
    bindButton('mLoadTextbook', openTextbookImporterFallback);
    bindButton('btnTheme', toggleThemeFallback);
    bindButton('mTheme', toggleThemeFallback);
    bindButton('btnHelp', showHelpFallback);
    bindButton('mHelp', showHelpFallback);
    bindButton('btnCloseTextbookImporter', closeTextbookImporterFallback);
    bindButton('btnChooseTextbookFile', triggerTextbookInputFallback);
    bindMobileMenuFallback();

    var jsonInput = get('fileInput');
    if (jsonInput instanceof HTMLInputElement && jsonInput.dataset.bootJsonFallbackBound !== '1') {
      jsonInput.dataset.bootJsonFallbackBound = '1';
      jsonInput.addEventListener('change', function () {
        if (!jsonInput.files || !jsonInput.files[0]) return;
        var file = jsonInput.files[0];

        if (window.__SHIME_CRITICAL_CONTROLS_READY || jsonInput.dataset.jsonBound === '1') return;

        var reader = new FileReader();
        reader.onload = function () {
          try {
            var text = String(reader.result || '');
            var parsed = JSON.parse(text);
            window.__SHIME_BOOT_PENDING_JSON = { name: file.name, text: text, data: parsed, createdAt: new Date().toISOString() };

            if (!tryPendingJsonHandoff('file-selected')) {
              setStatus('Đã chọn file JSON hợp lệ. Đang chờ ứng dụng hoàn tất khởi động để nạp dữ liệu...');
              schedulePendingJsonHandoffRetry();
            }
          } catch (error) {
            console.error('[ShimeChamhoc boot guard] Invalid recovery JSON:', error);
            setStatus('File JSON không hợp lệ hoặc sai định dạng.');
          } finally {
            jsonInput.value = '';
          }
        };
        reader.onerror = function () {
          console.error('[ShimeChamhoc boot guard] Cannot read recovery JSON:', reader.error);
          setStatus('Không đọc được file JSON.');
          jsonInput.value = '';
        };
        reader.readAsText(file, 'utf-8');
      });
    }
  }

  window.debugToolbarHitTest = function () {
    var ids = ['btnLoadJson', 'btnLoadTextbook', 'btnTheme', 'btnHelp', 'btnTools', 'mLoadJson', 'mLoadTextbook', 'mTheme', 'mHelp'];
    return ids.map(function (id) {
      var el = get(id);
      if (!el) return { id: id, found: false };
      var rect = el.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var hit = document.elementFromPoint(x, y);
      return {
        id: id,
        found: true,
        hitId: hit && hit.id,
        hitTag: hit && hit.tagName,
        blocked: Boolean(hit && hit !== el && !el.contains(hit))
      };
    });
  };

  window.addEventListener('error', function (event) {
    if (window.__SHIME_MAIN_MODULE_LOADED) return;
    console.error('[ShimeChamhoc boot guard] Error before main module ready:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', function (event) {
    if (window.__SHIME_MAIN_MODULE_LOADED) return;
    console.error('[ShimeChamhoc boot guard] Rejection before main module ready:', event.reason);
  });

  window.addEventListener('shime-json-loader-ready', function () {
    tryPendingJsonHandoff('json-loader-ready');
  });

  window.addEventListener('shime-critical-controls-ready', function () {
    tryPendingJsonHandoff('critical-controls-ready-event');
  });

  window.addEventListener('shime-app-ready', function () {
    clearHandoffRetry();
  });

  initThemeFallback();
  bindFallbackToolbar();
  tryPendingJsonHandoff('boot-guard-init');

  window.setTimeout(function () {
    if (window.__SHIME_APP_READY) return;
    reportBootProblem(window.__SHIME_MAIN_MODULE_LOADED ? 'main-loaded-but-app-not-ready' : 'main-module-not-loaded');
  }, BOOT_TIMEOUT_MS);
})();
