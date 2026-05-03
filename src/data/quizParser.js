function normalizeLines(raw) {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .split("\n");
}

export function parseTextbookToQuizzes(raw, opts = {}) {
  const {
    splitByChapter = true,
    keepAnswerInExplanation = true,
    markMissingAnswer = false
  } = opts;

  const lines = normalizeLines(raw);

  const reChapter = /^\s*(?:ch(?:ươ|u)ơng|chapter)\s*([0-9]+)\s*[:\-.]?\s*(.*)$/i;
  const reQStart = /^\s*(\d{1,4})\s*[\)\.\:\-]\s*(.+)$/;
  const reChoice = /^\s*([A-D])\s*[\)\.\:\-]\s*(.+)$/i;
  const reAnswer = /^\s*(?:đáp\s*án|dap\s*an|ans(?:wer)?)\s*[:\-–=]*\s*([A-D](?:\s*(?:,|\/|và|and)\s*[A-D])*)\s*$/i;
  const reExplain = /^\s*(?:giải\s*thích|giai\s*thich|explain(?:ation)?)\s*[:\-–=]*\s*(.*)$/i;

  function newQuiz(title) {
    return { title: title || "Bộ câu hỏi", timeLimit: 0, questions: [] };
  }

  let quizzes = [];
  let curQuiz = newQuiz();
  let curQ = null;
  let pendingExplain = [];

  const idxMap = { A: 0, B: 1, C: 2, D: 3 };

  function normalizeAnswerRaw(rawAns) {
    const letters = String(rawAns || "")
      .toUpperCase()
      .split(/[,\/]|và|and/i)
      .map(s => s.trim())
      .filter(Boolean)
      .filter(s => /^[A-D]$/.test(s));
    if (!letters.length) return null;
    const arr = [...new Set(letters.map(l => idxMap[l]))].sort((a, b) => a - b);
    return arr.length === 1 ? arr[0] : arr;
  }

  function flushQuestion() {
    if (!curQ) return;

    if (pendingExplain.length) {
      const exp = pendingExplain.join("\n").trim();
      if (exp) curQ.explanation = curQ.explanation ? (curQ.explanation + "\n" + exp) : exp;
      pendingExplain = [];
    }

    if (!curQ.text || !Array.isArray(curQ.choices) || curQ.choices.length < 2) {
      curQ = null;
      return;
    }

    if (curQ.answer == null && keepAnswerInExplanation && curQ._rawAnswer) {
      curQ.explanation = (curQ.explanation ? (curQ.explanation + "\n") : "") + `Đáp án (thô): ${curQ._rawAnswer}`;
    }
    delete curQ._rawAnswer;

    curQuiz.questions.push(curQ);
    curQ = null;
  }

  function flushQuizIfHasQuestions() {
    flushQuestion();
    if (curQuiz.questions.length) quizzes.push(curQuiz);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const mCh = reChapter.exec(line);
    if (mCh && splitByChapter) {
      flushQuizIfHasQuestions();
      const chapNum = mCh[1];
      const chapName = (mCh[2] || "").trim();
      curQuiz = newQuiz(`Chương ${chapNum}${chapName ? ": " + chapName : ""}`);
      continue;
    }

    const mQ = reQStart.exec(line);
    if (mQ) {
      flushQuestion();
      const qno = Number(mQ[1]);
      curQ = {
        _qno: Number.isFinite(qno) ? qno : null,
        text: mQ[2].trim(),
        choices: [],
        answer: null,
        explanation: ""
      };
      pendingExplain = [];
      continue;
    }

    if (!curQ) continue;

    const mC = reChoice.exec(line);
    if (mC) {
      curQ.choices.push(mC[2].trim());
      continue;
    }

    const mA = reAnswer.exec(line);
    if (mA) {
      const rawAns = mA[1].toUpperCase().trim();
      curQ._rawAnswer = rawAns;
      const ans = normalizeAnswerRaw(rawAns);
      if (ans != null) curQ.answer = ans;
      continue;
    }

    const mE = reExplain.exec(line);
    if (mE) {
      const rest = (mE[1] || "").trim();
      if (rest) pendingExplain.push(rest);
      continue;
    }

    if (curQ.choices.length === 0 && curQ.text) {
      curQ.text += "\n" + line;
    } else {
      pendingExplain.push(line);
    }
  }

  flushQuizIfHasQuestions();

  let runningId = 0;
  quizzes.forEach(qz => qz.questions.forEach(q => { if (q._id == null) q._id = runningId++; }));

  const allQuestions = quizzes.flatMap(qz => qz.questions);
  const missing = allQuestions.filter(q => q.answer == null).length;

  if (missing > 0) {
    const ansMap = extractAnswerKeyFromTail(lines);
    if (ansMap.size) {
      for (const q of allQuestions) {
        if (q.answer != null) continue;
        if (q._qno == null) continue;
        const raw = ansMap.get(q._qno);
        if (!raw) continue;
        const ans = normalizeAnswerRaw(raw);
        if (ans != null) q.answer = ans;
      }
    }
  }

  for (const q of allQuestions) {
    if (q.answer == null) {
      if (markMissingAnswer) q._missingAnswer = true;
      if (keepAnswerInExplanation) {
        q.explanation = (q.explanation ? (q.explanation + "\n") : "") + "⚠️ Thiếu đáp án: mặc định chấm A.";
      }
      q.answer = 0;
    }
  }

  quizzes.forEach(qz => qz.questions.forEach(q => { delete q._qno; }));

  return quizzes;
}

function extractAnswerKeyFromTail(linesArr) {
  const map = new Map();
  const maxScan = 250;
  let scanned = 0;
  let foundAny = false;

  const pairRe = /(\d{1,4})\s*[\.\-\)\:\s]\s*([A-D])\b/gi;

  for (let i = linesArr.length - 1; i >= 0 && scanned < maxScan; i--) {
    const ln = String(linesArr[i] || "").trim();
    if (!ln) continue;
    scanned++;

    let m;
    let localCount = 0;
    pairRe.lastIndex = 0;
    while ((m = pairRe.exec(ln)) !== null) {
      const qno = Number(m[1]);
      const letter = m[2].toUpperCase();
      if (!Number.isFinite(qno)) continue;
      const prev = map.get(qno);
      map.set(qno, prev ? `${prev},${letter}` : letter);
      localCount++;
    }

    if (localCount >= 3) foundAny = true;
    if (foundAny && localCount === 0) break;
  }

  return map;
}
