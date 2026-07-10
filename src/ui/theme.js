import {
  applyUiTheme,
  initializeUiTheme,
  readStoredUiTheme
} from '../uiTheme/themeRuntime.js';

export function setTheme(theme) {
  return applyUiTheme(theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || readStoredUiTheme();
  return setTheme(current === 'light' ? 'dark' : 'light');
}

export function initTheme(button) {
  const savedTheme = initializeUiTheme();
  button?.addEventListener("click", toggleTheme);
  return savedTheme;
}
