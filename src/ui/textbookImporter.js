import { parseTextbookToQuizzes } from "../data/quizParser.js";
import { $ } from "./dom.js";
import { closeTextbookImporter, openTextbookImporter } from "./modals.js";
import { sanitizeHTML } from "../utils/sanitize.js";
import { showToast } from "./toast.js";

const MAX_PREVIEW_TEXT = 600;

function normalizeDuplicateText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, max = MAX_PREVIEW_TEXT) {
  const text = String(value ?? "").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function cloneQuizData(quizzes) {
  return JSON.parse(JSON.stringify(quizzes || []));
}

function stripImporterMetadata(quizzes) {
  return cloneQuizData(quizzes)
    .map(quiz => ({
      ...quiz,
      questions: (quiz.questions || []).map(question => {
        const clean = { ...question };
        delete clean._missingAnswer;
        delete clean._importPreviewId;
        delete clean._validation;
        delete clean._duplicateKey;
        return clean;
      })
    }))
    .filter(quiz => Array.isArray(quiz.questions) && quiz.questions.length);
}

function answerToLabel(answer, choices = []) {
  if (answer == null) return "Không rõ";

  const toOne = index => {
    const n = Number(index);
    if (!Number.isInteger(n)) return String(index);
    const letter = String.fromCharCode(65 + n);
    const choice = choices[n];
    return choice ? `${letter}. ${choice}` : letter;
  };

  return Array.isArray(answer) ? answer.map(toOne).join("; ") : toOne(answer);
}

function answerIndexes(answer) {
  if (answer == null) return [];
  return (Array.isArray(answer) ? answer : [answer])
    .map(Number)
    .filter(Number.isInteger);
}

function validateQuestion(question, duplicateCount) {
  const warnings = [];
  const errors = [];
  const choices = Array.isArray(question.choices)
    ? question.choices.map(choice => String(choice ?? "").trim()).filter(Boolean)
    : [];

  question.choices = choices;

  if (!String(question.text || "").trim()) errors.push("Thiếu nội dung câu hỏi");
  if (choices.length < 2) errors.push("Cần ít nhất 2 lựa chọn");
  if (question._missingAnswer || question.answer == null) errors.push("Thiếu đáp án đúng");

  const indexes = answerIndexes(question.answer);
  if (!question._missingAnswer && indexes.length) {
    const invalidAnswer = indexes.some(index => index < 0 || index >= choices.length);
    if (invalidAnswer) errors.push("Đáp án đúng nằm ngoài danh sách lựa chọn");
  }

  if (duplicateCount > 1) warnings.push("Có vẻ trùng câu hỏi khác");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingAnswer: Boolean(question._missingAnswer || question.answer == null),
    duplicate: duplicateCount > 1
  };
}

function preparePreviewQuizzes(quizzes) {
  const preview = cloneQuizData(quizzes);
  const duplicateCounts = new Map();

  preview.forEach(quiz => {
    (quiz.questions || []).forEach(question => {
      const key = normalizeDuplicateText(question.text);
      question._duplicateKey = key;
      if (key) duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1);
    });
  });

  let nextId = 0;
  preview.forEach((quiz, quizIndex) => {
    quiz.questions = (quiz.questions || []).map((question, questionIndex) => {
      question._importPreviewId = `q-${quizIndex}-${questionIndex}-${nextId++}`;
      question._validation = validateQuestion(question, duplicateCounts.get(question._duplicateKey) || 0);
      return question;
    });
  });

  return preview;
}

function getPreviewStats(quizzes) {
  const questions = quizzes.flatMap(quiz => quiz.questions || []);
  const validQuestions = questions.filter(question => question._validation?.valid);
  const invalidQuestions = questions.filter(question => !question._validation?.valid);
  const missingAnswer = questions.filter(question => question._validation?.missingAnswer).length;
  const duplicates = questions.filter(question => question._validation?.duplicate).length;

  return {
    total: questions.length,
    valid: validQuestions.length,
    invalid: invalidQuestions.length,
    missingAnswer,
    duplicates
  };
}

function createValidQuizzes(previewQuizzes) {
  return stripImporterMetadata(previewQuizzes.map(quiz => ({
    ...quiz,
    questions: (quiz.questions || []).filter(question => question._validation?.valid)
  })));
}

function createPreviewBadge(text, className = "") {
  const badge = document.createElement("span");
  badge.className = `importPreviewBadge ${className}`.trim();
  badge.textContent = text;
  return badge;
}

function createQuestionPreview(question, quizTitle, onRemove) {
  const item = document.createElement("article");
  const validation = question._validation || { valid: false, errors: ["Không hợp lệ"], warnings: [] };
  item.className = `importPreviewItem ${validation.valid ? "is-valid" : "is-invalid"}`;

  const top = document.createElement("div");
  top.className = "importPreviewItemTop";

  const title = document.createElement("div");
  title.className = "importPreviewQuestionTitle";
  title.textContent = quizTitle || "Bộ câu hỏi";
  top.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "importPreviewActions";
  actions.appendChild(createPreviewBadge(validation.valid ? "Hợp lệ" : "Cần sửa", validation.valid ? "is-valid" : "is-invalid"));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn small secondary";
  removeButton.textContent = "Bỏ câu này";
  removeButton.addEventListener("click", () => onRemove?.(question._importPreviewId));
  actions.appendChild(removeButton);

  top.appendChild(actions);
  item.appendChild(top);

  const text = document.createElement("div");
  text.className = "importPreviewQuestionText";
  text.textContent = truncateText(question.text || "(Thiếu nội dung câu hỏi)");
  item.appendChild(text);

  const choices = Array.isArray(question.choices) ? question.choices : [];
  if (choices.length) {
    const list = document.createElement("ol");
    list.className = "importPreviewChoices";
    choices.forEach((choice, index) => {
      const li = document.createElement("li");
      li.textContent = truncateText(choice, 260);
      if (answerIndexes(question.answer).includes(index) && !question._missingAnswer) {
        li.classList.add("is-answer");
      }
      list.appendChild(li);
    });
    item.appendChild(list);
  }

  const answer = document.createElement("div");
  answer.className = "importPreviewAnswer muted";
  answer.textContent = `Đáp án: ${question._missingAnswer ? "Chưa phát hiện" : answerToLabel(question.answer, choices)}`;
  item.appendChild(answer);

  if (validation.errors.length || validation.warnings.length) {
    const notes = document.createElement("ul");
    notes.className = "importPreviewNotes";
    [...validation.errors, ...validation.warnings].forEach(note => {
      const li = document.createElement("li");
      li.textContent = note;
      notes.appendChild(li);
    });
    item.appendChild(notes);
  }

  return item;
}

export function initTextbookImporter({ onQuizzesLoaded } = {}) {
  let previewQuizzes = null;
  let generatedQuizzes = null;

  function setReport(message, tone = "") {
    const report = $("#importerReport");
    if (!report) return;
    report.classList.toggle("is-error", tone === "error");
    report.classList.toggle("is-success", tone === "success");
    report.textContent = message;
  }

  function setActionState() {
    const stats = previewQuizzes ? getPreviewStats(previewQuizzes) : null;
    generatedQuizzes = previewQuizzes ? createValidQuizzes(previewQuizzes) : null;
    const hasValid = Boolean(stats?.valid);

    $("#btnDownloadGenerated") && ($("#btnDownloadGenerated").disabled = !hasValid);
    $("#btnImportValidQuestions") && ($("#btnImportValidQuestions").disabled = !hasValid);
  }

  function renderPreview() {
    const preview = $("#importPreview");
    const summary = $("#importValidationSummary");
    if (!preview || !summary) return;

    preview.replaceChildren();
    summary.replaceChildren();

    if (!previewQuizzes) {
      preview.hidden = true;
      summary.hidden = true;
      setActionState();
      return;
    }

    const stats = getPreviewStats(previewQuizzes);
    summary.hidden = false;
    preview.hidden = false;

    const summaryItems = [
      ["Tổng", stats.total, ""],
      ["Hợp lệ", stats.valid, "is-valid"],
      ["Không hợp lệ", stats.invalid, "is-invalid"],
      ["Thiếu đáp án", stats.missingAnswer, stats.missingAnswer ? "is-warning" : ""],
      ["Có vẻ trùng", stats.duplicates, stats.duplicates ? "is-warning" : ""]
    ];

    summaryItems.forEach(([label, value, className]) => {
      const item = document.createElement("div");
      item.className = `importSummaryItem ${className}`.trim();
      const valueEl = document.createElement("strong");
      valueEl.textContent = String(value);
      const labelEl = document.createElement("span");
      labelEl.textContent = label;
      item.append(valueEl, labelEl);
      summary.appendChild(item);
    });

    previewQuizzes.forEach(quiz => {
      (quiz.questions || []).forEach(question => {
        preview.appendChild(createQuestionPreview(question, quiz.title, removePreviewQuestion));
      });
    });

    if (!stats.total) {
      const empty = document.createElement("div");
      empty.className = "muted importPreviewEmpty";
      empty.textContent = "Không còn câu hỏi nào trong bản xem trước.";
      preview.appendChild(empty);
    }

    setActionState();
  }

  function removePreviewQuestion(previewId) {
    if (!previewQuizzes) return;

    previewQuizzes = previewQuizzes
      .map(quiz => ({
        ...quiz,
        questions: (quiz.questions || []).filter(question => question._importPreviewId !== previewId)
      }))
      .filter(quiz => quiz.questions.length);

    if (!previewQuizzes.length) previewQuizzes = null;
    renderPreview();
  }

  function resetPreview() {
    previewQuizzes = null;
    generatedQuizzes = null;
    renderPreview();
    setReport("Đã hủy bản xem trước. Bạn có thể chỉnh nội dung rồi bấm Xem trước lại.");
  }

  function loadValidQuestions() {
    if (!generatedQuizzes?.length) {
      setReport("❌ Không có câu hỏi hợp lệ để nạp. Hãy kiểm tra cảnh báo trong bản xem trước.", "error");
      showToast("Không có câu hỏi hợp lệ để nạp.", { type: "error" });
      return;
    }

    onQuizzesLoaded?.(generatedQuizzes);
    closeTextbookImporter();
    $("#statusMessage").innerHTML =
      `Đã tạo từ giáo trình: <b>${sanitizeHTML(generatedQuizzes[0]?.title || "Bộ câu hỏi")}</b>. Bấm Bắt đầu ngay!`;
    showToast("Đã nạp câu hỏi hợp lệ từ giáo trình.", { type: "success" });
  }

  $("#textbookInput").onchange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = () => {
      $("#textbookArea").value = String(r.result || "");
      openTextbookImporter();
      resetPreview();
      setReport(`✅ Đã nạp file: ${f.name}. Bấm "Xem trước" để kiểm tra câu hỏi.`);
      showToast(`Đã nạp file giáo trình: ${f.name}`, { type: "success" });
    };
    r.readAsText(f, "utf-8");
    e.target.value = "";
  };

  function importerParse() {
    const raw = $("#textbookArea").value || "";
    if (!raw.trim()) {
      previewQuizzes = null;
      renderPreview();
      setReport("❌ Chưa có nội dung để parse.", "error");
      showToast("Chưa có nội dung để xem trước.", { type: "warning" });
      return;
    }

    const splitByChapter = $("#splitByChapter").checked;
    const keepAnswerInExplanation = $("#keepAnswerInExplanation").checked;
    const quizzes = parseTextbookToQuizzes(raw, {
      splitByChapter,
      keepAnswerInExplanation,
      markMissingAnswer: true
    });

    if (!quizzes.length) {
      previewQuizzes = null;
      renderPreview();
      setReport(
        "❌ Không parse được câu hỏi. Gợi ý: đảm bảo có dạng \"1) ...\", lựa chọn \"A. ...\", và dòng \"Đáp án: B\".",
        "error"
      );
      showToast("Không parse được câu hỏi từ nội dung này.", { type: "error", timeout: 7000 });
      return;
    }

    previewQuizzes = preparePreviewQuizzes(quizzes);
    renderPreview();

    const stats = getPreviewStats(previewQuizzes);
    if (!stats.valid) {
      setReport("⚠️ Đã parse được câu hỏi nhưng chưa có câu hợp lệ để nạp. Hãy kiểm tra phần cảnh báo bên dưới.", "error");
      showToast("Đã parse được nội dung nhưng chưa có câu hợp lệ.", { type: "warning", timeout: 7000 });
      return;
    }

    setReport(
      `✅ Xem trước ${stats.total} câu: ${stats.valid} hợp lệ, ${stats.invalid} cần sửa/bỏ. Bấm "Nạp câu hợp lệ" để dùng trong app.`,
      "success"
    );
    showToast(`Đã xem trước ${stats.total} câu, ${stats.valid} câu hợp lệ.`, { type: "success" });
  }

  function downloadGeneratedJSON() {
    if (!generatedQuizzes?.length) {
      setReport("❌ Không có câu hỏi hợp lệ để tải JSON.", "error");
      showToast("Không có câu hỏi hợp lệ để tải JSON.", { type: "error" });
      return;
    }

    const blob = new Blob([JSON.stringify(generatedQuizzes, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-quiz.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return {
    importerParse,
    downloadGeneratedJSON,
    importValidQuestions: loadValidQuestions,
    resetImportPreview: resetPreview
  };
}
