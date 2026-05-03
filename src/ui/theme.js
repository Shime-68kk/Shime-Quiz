const THEME_KEY = "theme";

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

export function initTheme(button) {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  setTheme(savedTheme);
  button?.addEventListener("click", toggleTheme);
}
