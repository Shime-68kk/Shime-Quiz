import { $ } from "./dom.js";

let importerTrigger = null;
let sheepTrigger = null;

function restoreFocus(target) {
  if (target instanceof HTMLElement && document.contains(target)) {
    target.focus({ preventScroll: true });
  }
}

export function setupMobileToolsMenu({ onLoadJson, onLoadTextbook, onToggleTheme, onHelp } = {}) {
  const btnTools = document.getElementById("btnTools");
  const menu = document.getElementById("toolMenu");
  const mLoadJson = document.getElementById("mLoadJson");
  const mLoadTextbook = document.getElementById("mLoadTextbook");
  const mTheme = document.getElementById("mTheme");
  const mHelp = document.getElementById("mHelp");

  if (!btnTools || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("show", open);
    btnTools.setAttribute("aria-expanded", open ? "true" : "false");
  };
  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen(!menu.classList.contains("show"));

  btnTools.addEventListener("click", e => {
    e.stopPropagation();
    toggleMenu();
  });

  mLoadJson?.addEventListener("click", () => {
    closeMenu();
    onLoadJson?.();
  });
  mLoadTextbook?.addEventListener("click", () => {
    closeMenu();
    onLoadTextbook?.();
  });
  mTheme?.addEventListener("click", () => {
    closeMenu();
    onToggleTheme?.();
  });
  mHelp?.addEventListener("click", () => {
    closeMenu();
    onHelp?.();
  });

  document.addEventListener("click", e => {
    if (!menu.contains(e.target) && e.target !== btnTools) closeMenu();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.classList.contains("show")) {
      e.preventDefault();
      closeMenu();
      btnTools.focus({ preventScroll: true });
    }
  });

  window.addEventListener("resize", closeMenu);
}

export function openTextbookImporter() {
  importerTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const modal = $("#importerModal");
  modal.style.display = "flex";
  $("#importerReport").textContent = "👉 Dán nội dung hoặc chọn file, rồi bấm \"Tạo quiz JSON\".";

  requestAnimationFrame(() => {
    const first = document.getElementById("textbookArea") || document.getElementById("btnChooseTextbookFile");
    first?.focus({ preventScroll: true });
  });
}

export function closeTextbookImporter() {
  $("#importerModal").style.display = "none";
  restoreFocus(importerTrigger);
  importerTrigger = null;
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  const importer = document.getElementById("importerModal");
  if (importer && getComputedStyle(importer).display !== "none") {
    event.preventDefault();
    closeTextbookImporter();
    return;
  }

  const sheep = document.getElementById("sheepPopup");
  if (sheep && getComputedStyle(sheep).display !== "none") {
    event.preventDefault();
    document.getElementById("btnCloseSheepPopup")?.click();
  }
});

export function importerPasteExample() {
  $("#textbookArea").value =
`CHƯƠNG 1: Mở đầu
1) Câu 1 là gì?
A. Đáp án A
B. Đáp án B
C. Đáp án C
D. Đáp án D
Đáp án: B
Giải thích: Vì ...

2) Câu 2 ...
A) ...
B) ...
C) ...
D) ...
Đáp án: A

CHƯƠNG 2: ...
1. Câu ...
A. ...
B. ...
C. ...
D. ...
Đáp án: D`;
  $("#textbookArea")?.focus({ preventScroll: true });
}

export function createSheepPopupController() {
  let wrongStreak = 0;
  let lastWrongKey = "";
  let sheepOpen = false;

  function close() {
    $("#sheepPopup").style.display = "none";
    wrongStreak = 0;
    sheepOpen = false;
    lastWrongKey = "";
    restoreFocus(sheepTrigger);
    sheepTrigger = null;
  }

  function recordAnswer({ instant, idx, userVal, isWrong }) {
    if (!instant || userVal === null) return;

    const key = `${idx}|${Array.isArray(userVal) ? userVal.join(",") : userVal}`;

    if (isWrong) {
      if (key !== lastWrongKey) {
        wrongStreak++;
        lastWrongKey = key;
      }

      if (wrongStreak >= 3 && !sheepOpen) {
        sheepOpen = true;
        sheepTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        $("#sheepPopup").style.display = "flex";
        requestAnimationFrame(() => document.getElementById("btnCloseSheepPopup")?.focus({ preventScroll: true }));
      }
      return;
    }

    wrongStreak = 0;
    lastWrongKey = "";
  }

  return { close, recordAnswer };
}
