export function asArrayAnswer(ans) {
  if (Array.isArray(ans)) return ans.slice().map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (typeof ans === "number" && Number.isFinite(ans)) return [ans];
  return [];
}

export function asArrayUserAns(v) {
  if (Array.isArray(v)) return v.slice().map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (typeof v === "number" && Number.isFinite(v)) return [v];
  return [];
}

export function isFillQuestion(q) {
  return q?.type === "input" || q?.type === "fill" || !Array.isArray(q?.choices);
}

export function normFill(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function toNumberMaybe(s) {
  const t = normFill(s).replace(",", ".");
  if (!t) return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export function isAnswerCorrect(q, userVal) {
  if (isFillQuestion(q)) {
    const correct = (q.answerText ?? q.answer ?? "").toString();
    const u = normFill(userVal);
    const c = normFill(correct);

    if (!u || !c) return false;

    const un = toNumberMaybe(u);
    const cn = toNumberMaybe(c);
    if (Number.isFinite(un) && Number.isFinite(cn)) return Math.abs(un - cn) < 1e-9;

    return u === c;
  }

  const a = asArrayAnswer(q.answer);
  const u = asArrayUserAns(userVal);
  if (!a.length) return false;
  if (a.length !== u.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== u[i]) return false;
  return true;
}

export function isChoiceCorrect(q, choiceIndex) {
  return asArrayAnswer(q.answer).includes(choiceIndex);
}

export function calculateQuizScore(quiz, answers) {
  let totalCorrect = 0;

  quiz.questions.forEach((q, i) => {
    const userVal = answers[i]?.value ?? null;
    if (userVal !== null && isAnswerCorrect(q, userVal)) totalCorrect++;
  });

  const total = quiz.questions.length;
  const percent = Math.round((totalCorrect / total) * 100);

  return { totalCorrect, total, percent };
}
