import { asArrayUserAns, isAnswerCorrect, isChoiceCorrect, isFillQuestion } from "../quiz/scoring.js";
import { sanitizeHTML } from "../utils/sanitize.js";
import { fetchWithTimeout, shortTitle } from "../utils/helpers.js";
import { $ } from "./dom.js";

export function toMathTargets(target) {
  if (!target) return [];
  return Array.isArray(target) ? target.filter(Boolean) : [target];
}

export function whenMathJaxReady() {
  if (!window.MathJax) return Promise.resolve();
  if (MathJax.startup && MathJax.startup.promise) return MathJax.startup.promise;
  return Promise.resolve();
}

let mathRenderTimer = null;
let mathTypesetChain = Promise.resolve();
let mathFallbackShown = false;

function showMathFallbackNotice() {
  if (mathFallbackShown) return;
  mathFallbackShown = true;
  document.body?.classList.add("mathjax-unavailable");
  const notice = document.getElementById("mathFallbackNotice");
  if (notice) notice.hidden = false;
}

function canTypesetMath() {
  return Boolean(window.MathJax?.typesetPromise);
}

export function renderMath(target) {
  if (!canTypesetMath()) {
    showMathFallbackNotice();
    return;
  }
  const els = toMathTargets(target);
  if (!els.length) return;

  mathTypesetChain = mathTypesetChain
    .then(() => whenMathJaxReady())
    .then(() => MathJax.typesetPromise(els))
    .catch(() => showMathFallbackNotice());
}

export function renderMathDebounced(target, delay = 50) {
  if (!canTypesetMath()) {
    showMathFallbackNotice();
    return;
  }
  const els = toMathTargets(target);
  if (!els.length) return;

  clearTimeout(mathRenderTimer);
  mathRenderTimer = setTimeout(() => {
    mathTypesetChain = mathTypesetChain
      .then(() => whenMathJaxReady())
      .then(() => MathJax.typesetPromise(els))
      .catch(() => showMathFallbackNotice());
  }, delay);
}

export function typesetAndThen(targets, done) {
  if (!canTypesetMath()) {
    showMathFallbackNotice();
    done?.();
    return;
  }

  const els = toMathTargets(targets);
  if (!els.length) {
    done?.();
    return;
  }

  mathTypesetChain = mathTypesetChain
    .then(() => whenMathJaxReady())
    .then(() => MathJax.typesetPromise(els))
    .catch(() => showMathFallbackNotice())
    .finally(() => done?.());
}

export function setupChoiceDelegation(selectChoice) {
  const box = document.getElementById("qChoices");
  if (!box) return;

  const activateChoice = (target) => {
    const choice = target?.closest?.(".choice[data-choice]");
    if (!choice) return;

    const index = Number(choice.dataset.choice);
    if (Number.isFinite(index)) selectChoice(index);
  };

  box.addEventListener("pointerdown", e => activateChoice(e.target), { passive: true });

  box.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const choice = e.target.closest(".choice[data-choice]");
    if (!choice) return;
    e.preventDefault();
    activateChoice(choice);
  });
}

export function initAIExplain({
  getQuiz,
  getIndex,
  getAnswers,
  apiBase = "https://quizct11.onrender.com"
}) {
  const aiExplainCache = new Map();
  const aiExplainInflight = new Map();

  function aiCacheKey(q, userAns) {
    const qid = (q && (q._id ?? q.id ?? q.qid ?? "")) + "";
    const ua = Array.isArray(userAns)
      ? userAns.slice().sort((a, b) => a - b).join(",")
      : String(userAns ?? "");
    return `${qid}|${ua}`;
  }

  function normalizeUserAnswerForAI(userAns) {
    if (Array.isArray(userAns)) return userAns.slice().sort((a, b) => a - b);
    return userAns ?? null;
  }

  async function fetchAIExplain({ q, userAnsIndex, correctAnsIndex, onChunk, timeoutMs = 12000 }) {
    const payload = {
      question: q.text,
      choices: q.choices,
      userAnswerIndex: normalizeUserAnswerForAI(userAnsIndex),
      correctAnswerIndex: correctAnsIndex,
      teacherExplanation: q.explanation || ""
    };

    const res = await fetchWithTimeout(`${apiBase}/api/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/plain, text/event-stream, application/json"
      },
      body: JSON.stringify(payload)
    }, timeoutMs);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const ct = (res.headers.get("content-type") || "").toLowerCase();

    if (ct.includes("application/json")) {
      const data = await res.json();
      return String(data.explanation || "");
    }

    if (!res.body || !onChunk) {
      const t = await res.text();
      return String(t || "");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let full = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onChunk(chunk, full);
    }
    return full;
  }

  function renderAIBox(htmlOrText, { streaming = false } = {}) {
    const box = $("#explain");
    box.innerHTML = `<b>AI giải thích:</b><br>${sanitizeHTML(htmlOrText)}`;
    if (!streaming) renderMathDebounced(box, 60);
  }

  async function getAIExplainCached(q, userAnsIndex, correctAnsIndex, { streamToBox = false } = {}) {
    const key = aiCacheKey(q, userAnsIndex);

    if (aiExplainCache.has(key)) return aiExplainCache.get(key).raw;
    if (aiExplainInflight.has(key)) return aiExplainInflight.get(key);

    const p = (async () => {
      const raw = await fetchAIExplain({
        q,
        userAnsIndex,
        correctAnsIndex,
        onChunk: streamToBox
          ? (chunk, full) => renderAIBox(full, { streaming: true })
          : null
      });
      aiExplainCache.set(key, { raw, ts: Date.now() });
      return raw;
    })().finally(() => {
      aiExplainInflight.delete(key);
    });

    aiExplainInflight.set(key, p);
    return p;
  }

  function prefetchAIExplain(q, userAnsIndex) {
    if (!q || !getQuiz()) return;
    getAIExplainCached(q, userAnsIndex, q.answer, { streamToBox: false }).catch(() => {});
  }

  $("#btnAIExplain").onclick = async () => {
    const btn = $("#btnAIExplain");
    const quiz = getQuiz();
    if (!quiz) return;

    const idx = getIndex();
    const answers = getAnswers();
    const q = quiz.questions[idx];
    const userAnsIndex = answers[idx]?.value ?? null;
    const correctAnsIndex = q.answer;
    const key = aiCacheKey(q, userAnsIndex);

    if (aiExplainCache.has(key)) {
      renderAIBox(aiExplainCache.get(key).raw, { streaming: false });
      return;
    }

    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Đang hỏi AI...";
    $("#explain").textContent = "⏳ Đang tải giải thích...";

    try {
      const raw = await getAIExplainCached(q, userAnsIndex, correctAnsIndex, { streamToBox: true });
      renderAIBox(raw, { streaming: false });
    } catch (e) {
      $("#explain").textContent = "❌ Lỗi khi gọi AI: " + (e?.message || e);
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };

  return { prefetchAIExplain };
}

export function renderQuizSelect(quizzes) {
  const sel = $("#quizSelect");
  sel.innerHTML = "";

  quizzes.forEach((q, i) => {
    const full = q?.title || ("Đề " + (i + 1));
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = shortTitle(full, 50);
    opt.title = full;
    sel.appendChild(opt);
  });
}

export function buildQuestionMap({ quiz, onSelect }) {
  const grid = $("#questionGrid");
  if (!grid || !quiz) return [];

  grid.innerHTML = "";
  const cells = new Array(quiz.questions.length);

  quiz.questions.forEach((q, i) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "qcell";
    cell.textContent = i + 1;
    cell.dataset.i = i;
    cell.setAttribute("aria-label", `Câu ${i + 1}`);
    cell.onclick = () => onSelect(i);

    grid.appendChild(cell);
    cells[i] = cell;
  });

  return cells;
}

export function updateQuestionCell({ cell, question, answer, canShowResult }) {
  if (!cell) return;

  cell.classList.remove("done", "correct", "wrong", "bookmark", "current");

  if (answer !== null) cell.classList.add("done");
  if (question.bookmarked) cell.classList.add("bookmark");

  if (canShowResult && answer !== null) {
    if (isAnswerCorrect(question, answer)) cell.classList.add("correct");
    else cell.classList.add("wrong");
  }
}

export function updateCurrentQuestionCell({ cells, previousIndex, currentIndex }) {
  if (previousIndex >= 0 && cells[previousIndex]) {
    cells[previousIndex].classList.remove("current");
  }
  if (cells[currentIndex]) cells[currentIndex].classList.add("current");
}

export function applyChoiceUI({ quiz, idx, answers, isSubmitted, instant }) {
  const q = quiz.questions[idx];
  if (isFillQuestion(q)) return;
  const selected = answers[idx]?.value ?? null;
  const selectedArr = asArrayUserAns(selected);
  const nodes = Array.from($("#qChoices").children);

  nodes.forEach((node, i) => {
    node.classList.remove("active", "correct", "wrong");

    const input = node.querySelector("input");
    if (input) input.checked = selectedArr.includes(i);

    node.setAttribute("aria-checked", selectedArr.includes(i) ? "true" : "false");
    if (selectedArr.includes(i)) node.classList.add("active");

    const canShowResult = instant || isSubmitted;
    if (selectedArr.length && canShowResult) {
      if (isChoiceCorrect(q, i)) {
        node.classList.add("correct");
      } else if (selectedArr.includes(i)) {
        node.classList.add("wrong");
      }
    }
  });
}

export function renderQuestion({
  quiz,
  idx,
  answers,
  isSubmitted,
  instant,
  isMapBuilt,
  saveProgressDebounced,
  buildQuestionMapOnce,
  updateCell,
  updateCurrentCell,
  applyQuestionFilter,
  onBookmarkToggle
}) {
  const quizScreen = $("#screenQuiz");
  quizScreen.classList.add("is-switching");

  try {
    const q = quiz.questions[idx];
    if (!answers[idx]) answers[idx] = { value: null };
    q.bookmarked = Boolean(q.bookmarked);

    $("#qIndex").textContent = `Câu ${idx + 1}/${quiz.questions.length}`;

    const qTextEl = $("#qText");
    qTextEl.innerHTML = sanitizeHTML(q.text);

    const box = $("#qChoices");
    box.innerHTML = "";
    $("#explain").textContent = "";

    if (isFillQuestion(q)) {
      const cur = (answers[idx]?.value ?? "");

      box.innerHTML = `
        <div class="choice" style="cursor:default">
          <div style="width:100%">
            <div class="muted" style="margin-bottom:8px">Điền đáp án:</div>
            <input id="fillInput" type="text" placeholder="Nhập đáp án..."
              style="width:100%;padding:12px;border-radius:12px;
                     background:rgba(255,255,255,0.03);
                     color:var(--text);
                     border:1px solid var(--border);" />
          </div>
        </div>
      `;

      const inp = $("#fillInput");
      inp.value = cur;

      inp.oninput = () => {
        answers[idx].value = inp.value.trim() ? inp.value : null;
        saveProgressDebounced();
        if (isMapBuilt()) {
          updateCell(idx);
          applyQuestionFilter();
        }
      };

      const canShowResult = instant || isSubmitted;
      if (canShowResult && String(inp.value || "").trim() !== "") {
        const ok = isAnswerCorrect(q, inp.value);
        box.firstElementChild.classList.toggle("correct", ok);
        box.firstElementChild.classList.toggle("wrong", !ok);
      }

      typesetAndThen([qTextEl, box], () => {
        quizScreen.classList.remove("is-switching");
      });

      $("#btnPrev").disabled = (idx === 0);
      $("#btnNext").style.visibility = (idx === quiz.questions.length - 1) ? "hidden" : "visible";

      buildQuestionMapOnce();
      updateCell(idx);
      updateCurrentCell();
      applyQuestionFilter();

      wireBookmark({ q, idx, isMapBuilt, saveProgressDebounced, updateCell, applyQuestionFilter, onBookmarkToggle });
      return;
    }

    const isMulti = Array.isArray(q.answer);
    const inputType = isMulti ? "checkbox" : "radio";
    const inputName = "opt";

    q.choices.forEach((c, i) => {
      const wrap = document.createElement("div");
      wrap.className = "choice";
      wrap.dataset.choice = String(i);
      wrap.tabIndex = 0;
      wrap.setAttribute("role", isMulti ? "checkbox" : "radio");
      wrap.setAttribute("aria-checked", "false");
      wrap.innerHTML = `
        <input type="${inputType}" name="${inputName}" tabindex="-1" aria-hidden="true" style="margin-right:10px">
        <label style="cursor:pointer">${sanitizeHTML(c)}</label>
      `;
      box.appendChild(wrap);
    });

    applyChoiceUI({ quiz, idx, answers, isSubmitted, instant });

    typesetAndThen([qTextEl, box], () => {
      quizScreen.classList.remove("is-switching");
    });

    $("#btnPrev").disabled = (idx === 0);
    $("#btnNext").style.visibility = (idx === quiz.questions.length - 1) ? "hidden" : "visible";

    buildQuestionMapOnce();
    updateCell(idx);
    updateCurrentCell();
    applyQuestionFilter();

    wireBookmark({ q, idx, isMapBuilt, saveProgressDebounced, updateCell, applyQuestionFilter, onBookmarkToggle });
  } catch (e) {
    console.error(e);
    $("#screenQuiz").classList.remove("is-switching");
    $("#statusMessage").textContent = "❌ Lỗi render câu hỏi: " + (e?.message || e);
  }
}

function updateBookmarkButton(button, bookmarked) {
  button.classList.toggle("active", bookmarked);
  button.textContent = bookmarked ? "⭐" : "☆";
  button.title = bookmarked ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi";
  button.setAttribute("aria-label", button.title);
  button.setAttribute("aria-pressed", bookmarked ? "true" : "false");
}

function wireBookmark({ q, idx, isMapBuilt, saveProgressDebounced, updateCell, applyQuestionFilter, onBookmarkToggle }) {
  const bm = $("#bookmarkBtn");
  bm.setAttribute("role", "button");
  bm.tabIndex = 0;
  updateBookmarkButton(bm, Boolean(q.bookmarked));

  const toggle = () => {
    q.bookmarked = !q.bookmarked;
    onBookmarkToggle?.(q, q.bookmarked);
    updateBookmarkButton(bm, Boolean(q.bookmarked));
    saveProgressDebounced();
    if (isMapBuilt()) {
      updateCell(idx);
      applyQuestionFilter();
    }
  };

  bm.onclick = toggle;
  bm.onkeydown = event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  };
}
