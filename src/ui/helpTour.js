import { $ } from "./dom.js";
import { markHelpTourDone, readHelpTourDone } from "./helpTourStorage.js";

const tourSteps = [
  { el: "#btnLoadJson", text: "Bấm vào đây để nạp file JSON đề thi." },
  { el: "#btnLoadTextbook", text: "Nhập giáo trình để tự tạo đề." },
  { el: "#btnTheme", text: "Đổi giao diện sáng / tối tại đây." },
  { el: "#mTheme", text: "Trên điện thoại, đổi giao diện sáng / tối ở đây." },
  { el: "#quizSelect", text: "Chọn bộ đề muốn làm." },
  { el: "#btnStart", text: "Bắt đầu làm bài tại đây." },
  { el: "#bookmarkBtn", text: "Đánh dấu câu hỏi cần xem lại." },
  { el: "#btnAIExplain", text: "Nhờ AI giải thích khi chưa hiểu." },
  { el: "#questionMap", text: "Đây là bản đồ câu hỏi: xem nhanh trạng thái làm bài." },
  { el: "#questionGrid", text: "Bấm vào ô số để nhảy nhanh tới câu đó." },
  { el: "#filterWrong", text: "Dùng bộ lọc để xem các câu sai." },
  { el: "#filterBookmark", text: "Lọc các câu đã lưu." },
  { el: "#searchBox", text: "Tìm nhanh câu hỏi theo từ khóa." }
];

let helpTourController = null;

export function initHelpTour() {
  if (helpTourController) return helpTourController;

  let tourStep = 0;
  let isTourActive = false;
  let startScrollX = 0;
  let startScrollY = 0;
  let focusBeforeTour = null;
  let focusBeforeWelcome = null;

  function isVisible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function restoreFocus(target) {
    if (target instanceof HTMLElement && document.contains(target)) {
      target.focus({ preventScroll: true });
    }
  }

  function closeWelcome(markDone = false) {
    const welcome = document.getElementById("tourWelcome");
    if (welcome) welcome.style.display = "none";
    if (markDone) markHelpTourDone();
    restoreFocus(focusBeforeWelcome);
    focusBeforeWelcome = null;
  }

  function clearTourInlineStyles() {
    const spot = document.getElementById("tourSpotlight");
    const tip = document.getElementById("tourTooltip");

    if (spot) {
      spot.style.left = "";
      spot.style.top = "";
      spot.style.width = "";
      spot.style.height = "";
    }

    if (tip) {
      tip.style.left = "";
      tip.style.top = "";
      tip.style.maxWidth = "";
    }

    document.documentElement.style.removeProperty("--tour-overlay");
    document.documentElement.style.removeProperty("--tour-bright");
    document.documentElement.style.removeProperty("--tour-glow");
  }

  function cleanupTourUI() {
    document.getElementById("tourOverlay")?.style.setProperty("display", "none");
    document.getElementById("toolMenu")?.classList.remove("show");
    document.getElementById("btnHelp")?.classList.remove("active");
    document.getElementById("mHelp")?.classList.remove("active");
    document.querySelectorAll(".tour-target").forEach(el => el.classList.remove("tour-target"));
    clearTourInlineStyles();

    const shouldRestoreFocus = isTourActive;
    if (isTourActive) {
      window.scrollTo(startScrollX, startScrollY);
    }

    isTourActive = false;
    if (shouldRestoreFocus) {
      restoreFocus(focusBeforeTour);
      focusBeforeTour = null;
    }
  }

  function endTour() {
    cleanupTourUI();
    markHelpTourDone();
  }

  function ensureStepContext(stepElSelector) {
    const needQuizScreen = [
      "#bookmarkBtn", "#btnAIExplain", "#questionMap", "#questionGrid", "#qText", "#qChoices",
      "#filterAll", "#filterBookmark", "#filterWrong", "#searchBox"
    ].includes(stepElSelector);

    if (needQuizScreen && getComputedStyle($("#screenQuiz")).display === "none") {
      const startIndex = tourSteps.findIndex(s => s.el === "#btnStart");
      if (startIndex >= 0) {
        tourStep = startIndex;
        return false;
      }
    }

    return true;
  }

  function nextTour() {
    if (!isTourActive) return;

    tourStep++;
    if (tourStep >= tourSteps.length) return endTour();
    showTourStep(tourStep);
  }

  function prevTour() {
    if (!isTourActive) return;

    tourStep = Math.max(0, tourStep - 1);
    showTourStep(tourStep);
  }

  function showTourStep(i) {
    if (!isTourActive) return;

    const step = tourSteps[i];
    if (!step) return endTour();

    if (step.el === "#mTheme" || step.el === "#mLoadJson" || step.el === "#mLoadTextbook" || step.el === "#mHelp") {
      document.getElementById("toolMenu")?.classList.add("show");
    } else {
      document.getElementById("toolMenu")?.classList.remove("show");
    }

    if (!ensureStepContext(step.el)) {
      showTourStep(tourStep);
      return;
    }

    const el = document.querySelector(step.el);
    if (!isVisible(el)) return nextTour();

    document.querySelectorAll(".tour-target").forEach(x => x.classList.remove("tour-target"));
    el.classList.add("tour-target");
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    const r = el.getBoundingClientRect();
    const spot = document.getElementById("tourSpotlight");
    const tip = document.getElementById("tourTooltip");
    const text = document.getElementById("tourText");

    const pad = 8;
    const left = Math.max(pad, r.left - pad);
    const top = Math.max(pad, r.top - pad);
    const w = Math.min(window.innerWidth - pad * 2, r.width + pad * 2);
    const h = Math.min(window.innerHeight - pad * 2, r.height + pad * 2);

    spot.style.left = left + "px";
    spot.style.top = top + "px";
    spot.style.width = w + "px";
    spot.style.height = h + "px";

    text.textContent = step.text;

    const pad2 = 12;
    const isMobile = window.innerWidth < 640;
    tip.style.maxWidth = `min(420px, ${window.innerWidth - pad2 * 2}px)`;

    let tx = isMobile ? r.left : (r.right + 12);
    let ty = isMobile ? (r.bottom + 12) : r.top;

    tip.style.left = Math.round(tx) + "px";
    tip.style.top = Math.round(ty) + "px";

    requestAnimationFrame(() => {
      if (!isTourActive) return;

      const tr = tip.getBoundingClientRect();

      if (!isMobile && (tx + tr.width > window.innerWidth - pad2)) {
        tx = r.left - tr.width - 12;
      }

      tx = Math.min(window.innerWidth - pad2 - tr.width, Math.max(pad2, tx));

      if (ty + tr.height > window.innerHeight - pad2) {
        ty = r.top - tr.height - 12;
      }
      ty = Math.min(window.innerHeight - pad2 - tr.height, Math.max(pad2, ty));

      tip.style.left = Math.round(tx) + "px";
      tip.style.top = Math.round(ty) + "px";
    });
  }

  function setTourVars({ overlay, bright, glow } = {}) {
    const root = document.documentElement;
    if (overlay != null) root.style.setProperty("--tour-overlay", String(overlay));
    if (bright != null) root.style.setProperty("--tour-bright", String(bright));
    if (glow != null) root.style.setProperty("--tour-glow", String(glow));
  }

  function startHelpTour() {
    if (isTourActive) return;

    focusBeforeTour = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cleanupTourUI();
    closeWelcome(false);
    startScrollX = window.scrollX;
    startScrollY = window.scrollY;
    isTourActive = true;
    tourStep = 0;

    const overlay = document.getElementById("tourOverlay");
    if (overlay) overlay.style.display = "block";

    showTourStep(0);
    requestAnimationFrame(() => document.getElementById("tourNext")?.focus({ preventScroll: true }));
  }

  document.getElementById("tourNext")?.addEventListener("click", nextTour);
  document.getElementById("tourPrev")?.addEventListener("click", prevTour);
  document.getElementById("tourSkip")?.addEventListener("click", endTour);
  document.getElementById("tourDim")?.addEventListener("click", () => {
    setTourVars({ overlay: 0.55, bright: 1.35, glow: 0.65 });
  });
  document.getElementById("tourBright")?.addEventListener("click", () => {
    setTourVars({ overlay: 0.35, bright: 1.55, glow: 0.85 });
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;

    if (isTourActive) {
      e.preventDefault();
      endTour();
      return;
    }

    if (isVisible(document.getElementById("tourWelcome"))) {
      e.preventDefault();
      closeWelcome(true);
    }
  });

  window.addEventListener("resize", () => {
    if (isTourActive) showTourStep(tourStep);
  });

  window.addEventListener("DOMContentLoaded", () => {
    if (!readHelpTourDone()) {
      focusBeforeWelcome = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.getElementById("tourWelcome").style.display = "flex";
      requestAnimationFrame(() => document.getElementById("tourYes")?.focus({ preventScroll: true }));
    }

    document.getElementById("tourYes")?.addEventListener("click", startHelpTour);
    document.getElementById("tourNo")?.addEventListener("click", () => closeWelcome(true));
  });

  helpTourController = { startHelpTour, endHelpTour: endTour };
  return helpTourController;
}
