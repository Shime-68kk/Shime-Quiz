import { asArrayAnswer, asArrayUserAns, isAnswerCorrect, isFillQuestion } from "../quiz/scoring.js";
import { sanitizeHTML } from "../utils/sanitize.js";
import { previewText } from "../utils/helpers.js";
import { $ } from "./dom.js";
import { renderMathDebounced } from "./renderQuiz.js";

export function formatUserAnswer(q, val) {
  if (isFillQuestion(q)) {
    const s = String(val ?? "").trim();
    return s ? sanitizeHTML(s) : "Chưa trả lời";
  }

  const arr = asArrayUserAns(val);
  if (!arr.length) return "Chưa trả lời";
  return arr.map(i => sanitizeHTML(q.choices[i] ?? `(${i})`)).join(" | ");
}

export function formatCorrectAnswer(q) {
  if (isFillQuestion(q)) {
    const s = String(q.answerText ?? q.answer ?? "").trim();
    return s ? sanitizeHTML(s) : "(thiếu đáp án)";
  }

  const arr = asArrayAnswer(q.answer);
  return arr.map(i => sanitizeHTML(q.choices[i] ?? `(${i})`)).join(" | ");
}

export function getAnswerStatus(q, userAns) {
  if (userAns == null || (Array.isArray(userAns) && userAns.length === 0)) return "blank";
  return isAnswerCorrect(q, userAns) ? "correct" : "wrong";
}

function getQuestionTopic(question = {}, quiz = {}) {
  const value = [
    question.chapter,
    question.category,
    question.topic,
    question.section,
    question.group,
    Array.isArray(question.tags) ? question.tags[0] : '',
    quiz.chapter,
    quiz.category,
    quiz.topic
  ].find(item => String(item ?? '').trim());

  return String(value || 'Tất cả câu hỏi').trim();
}

function getTopicBreakdown({ quiz, answers } = {}) {
  const groups = new Map();
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  questions.forEach((question, index) => {
    const topic = getQuestionTopic(question, quiz);
    const current = groups.get(topic) || { topic, total: 0, correct: 0, wrong: 0, unanswered: 0, questionIndexes: [] };
    const userAns = answers?.[index]?.value ?? null;
    current.total += 1;
    current.questionIndexes.push(index);

    if (userAns === null || (Array.isArray(userAns) && userAns.length === 0)) current.unanswered += 1;
    else if (isAnswerCorrect(question, userAns)) current.correct += 1;
    else current.wrong += 1;

    groups.set(topic, current);
  });

  return Array.from(groups.values())
    .map(item => ({
      ...item,
      percentage: item.total ? Math.round((item.correct / item.total) * 100) : 0
    }))
    .sort((a, b) => {
      if (a.percentage !== b.percentage) return a.percentage - b.percentage;
      return b.total - a.total;
    });
}

export function buildResultTopicBreakdown({ quiz, answers } = {}) {
  return getTopicBreakdown({ quiz, answers }).map(({ questionIndexes, ...item }) => item);
}

function formatDuration(seconds) {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '';
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const secs = String(rounded % 60).padStart(2, '0');
  return minutes > 0 ? `${minutes}:${secs}` : `0:${secs}`;
}

function getUnansweredCount({ quiz, answers } = {}) {
  return Array.isArray(quiz?.questions)
    ? quiz.questions.reduce((count, _question, index) => {
        const value = answers?.[index]?.value ?? null;
        return count + (value === null || (Array.isArray(value) && value.length === 0) ? 1 : 0);
      }, 0)
    : 0;
}

function appendText(parent, text, className, tagName = 'div') {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function appendButton(parent, text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

function renderMockExamSummary({ quiz, answers, score, timeSpentSeconds, readinessImpact, onPracticeSection } = {}) {
  const area = document.createElement('section');
  area.className = 'mockExamSummary';
  area.setAttribute('aria-label', 'Tổng kết Mock Exam');

  const unanswered = getUnansweredCount({ quiz, answers });
  appendText(area, 'Mock Exam Summary', 'mockExamSummaryTitle');
  appendText(area, 'Tổng kết mô phỏng thi: điểm, thời gian, câu bỏ trống và nhóm nội dung cần ôn lại.', 'muted mockExamSummaryIntro');

  const metrics = document.createElement('div');
  metrics.className = 'mockExamMetrics';
  [
    ['Điểm', `${score.totalCorrect}/${score.total}`],
    ['Tỷ lệ', `${score.percent}%`],
    ['Sai', String(Math.max(0, score.total - score.totalCorrect - unanswered))],
    ['Chưa làm', String(unanswered)],
    ['Thời gian', formatDuration(timeSpentSeconds) || 'Không giới hạn']
  ].forEach(([label, value]) => {
    const metric = document.createElement('article');
    metric.className = 'mockExamMetric';
    appendText(metric, value, 'mockExamMetricValue');
    appendText(metric, label, 'muted mockExamMetricLabel');
    metrics.appendChild(metric);
  });
  area.appendChild(metrics);

  if (readinessImpact) appendText(area, readinessImpact, 'muted mockExamReadinessImpact');

  const breakdown = getTopicBreakdown({ quiz, answers });
  if (breakdown.length > 1 || (breakdown[0] && breakdown[0].topic !== 'Tất cả câu hỏi')) {
    appendText(area, 'Review by Section', 'mockExamSectionTitle');
    const list = document.createElement('div');
    list.className = 'mockExamSectionList';

    breakdown.forEach(section => {
      const item = document.createElement('article');
      item.className = `mockExamSection ${section.percentage >= 70 ? 'is-strong' : 'is-weak'}`;
      const head = document.createElement('div');
      head.className = 'mockExamSectionHead';
      appendText(head, section.topic, 'mockExamSectionName');
      appendText(head, `${section.correct}/${section.total} · ${section.percentage}%`, 'pill mockExamSectionScore', 'span');
      item.appendChild(head);
      appendText(item, `${section.wrong} sai · ${section.unanswered} chưa làm`, 'muted mockExamSectionMeta');
      const bar = document.createElement('div');
      bar.className = 'mockExamSectionBar';
      const fill = document.createElement('span');
      fill.style.width = `${Math.max(4, section.percentage)}%`;
      bar.appendChild(fill);
      item.appendChild(bar);
      const button = appendButton(item, 'Luyện phần này', 'btn small secondary', () => {
        onPracticeSection?.(section.topic, section.questionIndexes);
      });
      button.disabled = section.wrong + section.unanswered <= 0;
      list.appendChild(item);
    });
    area.appendChild(list);
  }

  return area;
}


export function renderReview({ quiz, answers, isMockExam = false, score = null, timeSpentSeconds = null, readinessImpact = "", onPracticeSection = null } = {}) {
  const area = $("#reviewArea");
  area.replaceChildren();
  if (isMockExam && score) {
    area.appendChild(renderMockExamSummary({ quiz, answers, score, timeSpentSeconds, readinessImpact, onPracticeSection }));
  }
  const hint = document.createElement("div");
  hint.className = "muted";
  hint.style.marginTop = "6px";
  hint.textContent = "Bấm vào từng câu để xem chi tiết đúng/sai.";
  area.appendChild(hint);
  const list = document.createElement("div");
  list.id = "reviewList";
  list.style.display = "grid";
  list.style.gap = "12px";
  list.style.marginTop = "14px";
  area.appendChild(list);

  quiz.questions.forEach((q, i) => {
    const userAns = answers[i]?.value ?? null;
    const status = getAnswerStatus(q, userAns);

    const badge =
      status === "correct" ? "✅ Đúng" :
      status === "wrong" ? "❌ Sai" :
      "⚪ Chưa làm";

    const borderColor =
      status === "correct" ? "var(--ok)" :
      status === "wrong" ? "var(--bad)" :
      "var(--border)";

    const item = document.createElement("div");
    item.className = "card pad reviewItem";
    item.style.borderLeft = `5px solid ${borderColor}`;
    item.style.cursor = "pointer";

    item.innerHTML = `
  <div class="reviewHead" style="display:flex; align-items:center; justify-content:space-between; gap:12px">
    <div style="min-width:0">
      <div style="font-weight:800">
        Câu ${i + 1} <span class="muted" style="font-weight:600">(${badge})</span>
      </div>

      <div class="muted"
           style="font-size:13px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${sanitizeHTML(previewText(q.text, 70))}
      </div>
    </div>

    <div class="muted reviewChevron" style="font-size:18px; flex:0 0 auto">▸</div>
  </div>

  <div class="reviewDetail" style="display:none; margin-top:12px">
    <div style="padding-top:10px; border-top:1px solid var(--border)">
      <div style="font-weight:800; margin-bottom:6px">Nội dung:</div>
      <div style="margin-bottom:10px">${sanitizeHTML(q.text)}</div>

      <div style="color:${status === "correct" ? "var(--ok)" : status === "wrong" ? "var(--bad)" : "var(--text)"}">
        <div><b>Bạn chọn:</b> ${formatUserAnswer(q, userAns)}</div>
        <div><b>Đáp án đúng:</b> ${formatCorrectAnswer(q)}</div>
      </div>

      ${q.explanation ? `
        <div class="muted" style="margin-top:8px; font-size:13px">
          ${sanitizeHTML(q.explanation)}
        </div>` : ``}
    </div>
  </div>
`;

    item.addEventListener("click", () => {
      const detail = item.querySelector(".reviewDetail");
      const chev = item.querySelector(".reviewChevron");
      const isOpen = detail.style.display !== "none";
      detail.style.display = isOpen ? "none" : "block";
      chev.textContent = isOpen ? "▸" : "▾";

      if (!isOpen) renderMathDebounced(detail, 80);
    });

    list.appendChild(item);
  });
}

function updatePracticeWrongButton({ quiz, answers, onPracticeWrong, onAddMistakesToNotebook }) {
  const button = $("#btnPracticeWrong");
  const notebookButton = $("#btnAddMistakesToNotebook");

  const wrongCount = Array.isArray(quiz?.questions)
    ? quiz.questions.reduce((count, question, index) => {
        const userAns = answers?.[index]?.value ?? null;
        return count + (userAns === null || !isAnswerCorrect(question, userAns) ? 1 : 0);
      }, 0)
    : 0;

  if (button) {
    button.textContent = wrongCount > 0 ? `Luyện lại câu sai (${wrongCount})` : 'Không có câu sai';
    button.disabled = wrongCount === 0;
    button.title = wrongCount > 0
      ? 'Tạo bài luyện tập từ các câu đã trả lời sai hoặc bỏ trống'
      : 'Bạn đã làm đúng toàn bộ câu hỏi';
    button.onclick = () => {
      if (wrongCount > 0) onPracticeWrong?.();
    };
  }

  if (notebookButton) {
    notebookButton.textContent = wrongCount > 0 ? `Thêm vào sổ lỗi (${wrongCount})` : 'Không có lỗi để lưu';
    notebookButton.disabled = wrongCount === 0;
    notebookButton.title = wrongCount > 0
      ? 'Lưu các câu sai/chưa làm vào Sổ lỗi sai'
      : 'Bạn đã làm đúng toàn bộ câu hỏi';
    notebookButton.onclick = () => {
      if (wrongCount > 0) onAddMistakesToNotebook?.();
    };
  }
}

function renderScoreRing(score) {
  const percent = Math.max(0, Math.min(100, Number(score.percent) || 0));
  const ring = $("#scoreRing");
  const progress = $("#scoreRingProgress");
  const percentText = $("#scoreRingPercent");
  const subtext = $("#scoreRingSubtext");
  const circumference = 326.73;

  if (!ring || !progress || !percentText || !subtext) return;

  ring.setAttribute(
    "aria-label",
    `Điểm số ${percent}%, ${score.totalCorrect} trên ${score.total} câu đúng`
  );
  percentText.textContent = `${percent}%`;
  subtext.textContent = `${score.totalCorrect}/${score.total}`;

  ring.classList.remove("is-complete");
  progress.style.strokeDashoffset = String(circumference);

  requestAnimationFrame(() => {
    progress.style.strokeDashoffset = String(circumference - (circumference * percent) / 100);
    ring.classList.add("is-complete");
  });
}

export function showQuizResult({ quiz, answers, score, onPracticeWrong, onAddMistakesToNotebook, mode = "normal", timeSpentSeconds = null, readinessImpact = "", onPracticeSection = null } = {}) {
  const screenResult = $("#screenResult");
  const summary = document.querySelector(".resultSummary");
  const scoreBar = $("#scoreBar");

  $("#scoreLine").textContent = `Kết quả: ${score.totalCorrect}/${score.total} câu đúng (${score.percent}%)`;
  scoreBar.style.width = "0%";
  scoreBar.classList.remove("is-filled");
  summary?.classList.remove("is-visible");

  renderScoreRing(score);
  $("#screenQuiz").style.display = "none";
  screenResult.style.display = "block";

  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    summary?.classList.add("is-visible");
    scoreBar.style.width = score.percent + "%";
    scoreBar.classList.add("is-filled");
  });

  updatePracticeWrongButton({ quiz, answers, onPracticeWrong, onAddMistakesToNotebook });
  renderReview({
    quiz,
    answers,
    isMockExam: mode === "mock_exam",
    score,
    timeSpentSeconds,
    readinessImpact,
    onPracticeSection
  });
}
