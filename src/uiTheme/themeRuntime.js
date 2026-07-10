export const UI_THEME_IDS = Object.freeze(['light', 'dark', 'ocean', 'sunset', 'lavender']);
export const DEFAULT_UI_THEME = 'light';
export const UI_THEME_STORAGE_KEY = 'shime.ui.theme.v1';
export const LEGACY_THEME_STORAGE_KEY = 'theme';

export const REQUIRED_THEME_ROLES = Object.freeze([
  'canvas', 'canvas-muted', 'surface', 'surface-elevated', 'surface-subtle', 'overlay',
  'text-primary', 'text-secondary', 'text-muted', 'text-inverse', 'text-on-accent',
  'brand-primary', 'brand-primary-hover', 'brand-primary-active', 'brand-soft',
  'companion', 'companion-soft', 'companion-glow',
  'border-default', 'border-strong', 'divider',
  'control-background', 'control-hover', 'control-active', 'focus-ring',
  'navigation-active-background', 'navigation-active-text',
  'status-safe', 'status-safe-background', 'status-info', 'status-info-background',
  'status-warning', 'status-warning-background', 'status-danger', 'status-danger-background',
  'status-beta', 'status-beta-background', 'status-dev', 'status-dev-background',
  'progress-track', 'progress-fill', 'chart-primary', 'chart-secondary'
]);

export function normalizeUiTheme(theme) {
  return UI_THEME_IDS.includes(theme) ? theme : DEFAULT_UI_THEME;
}

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window !== 'undefined') return window.localStorage;
  return null;
}

export function readStoredUiTheme(storage) {
  try {
    const target = getStorage(storage);
    const current = target?.getItem(UI_THEME_STORAGE_KEY);
    if (UI_THEME_IDS.includes(current)) return current;
    const legacy = target?.getItem(LEGACY_THEME_STORAGE_KEY);
    return normalizeUiTheme(legacy);
  } catch {
    return DEFAULT_UI_THEME;
  }
}

export function applyUiTheme(theme, { persist = true, storage } = {}) {
  const normalized = normalizeUiTheme(theme);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', normalized);
  }
  if (persist) {
    try {
      getStorage(storage)?.setItem(UI_THEME_STORAGE_KEY, normalized);
    } catch {
      // The rendered theme remains active when storage is unavailable.
    }
  }
  return normalized;
}

export function initializeUiTheme(storage) {
  return applyUiTheme(readStoredUiTheme(storage), { persist: false, storage });
}

