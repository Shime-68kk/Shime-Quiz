import { pickRandom, shuffleInPlace } from "../utils/helpers.js";

export const EXAM_TITLE_PREFIX = "📝 Đề thi ngẫu nhiên";

export function createExamQuiz(allQuizzes, { total = 60, percents = [10, 45, 45] } = {}) {
  if (!Array.isArray(allQuizzes) || allQuizzes.length < 1) {
    throw new Error("Chưa có dữ liệu quiz.");
  }

  const chapters = [0, 1, 2].filter(i => allQuizzes[i] && Array.isArray(allQuizzes[i].questions));
  if (chapters.length === 0) throw new Error("Không tìm thấy chapters/questions trong data.json.");

  total = Math.max(1, Math.min(5000, Math.round(Number(total) || 1)));

  const p = percents.slice(0, chapters.length).map(x => Math.max(0, Number(x) || 0));
  let sumP = p.reduce((a, b) => a + b, 0);
  if (sumP <= 0) {
    for (let i = 0; i < p.length; i++) p[i] = 100 / p.length;
    sumP = 100;
  }

  const target = p.map(pi => Math.floor((pi / sumP) * total));
  let used = target.reduce((a, b) => a + b, 0);
  let remain = total - used;

  const cap = chapters.map(ci => (allQuizzes[ci].questions || []).length);

  while (remain > 0) {
    let best = -1;
    let bestSlack = -1;
    for (let i = 0; i < target.length; i++) {
      const slack = cap[i] - target[i];
      if (slack > bestSlack) {
        bestSlack = slack;
        best = i;
      }
    }
    if (best === -1 || bestSlack <= 0) break;
    target[best]++;
    remain--;
  }

  let picked = [];
  for (let i = 0; i < chapters.length; i++) {
    const ci = chapters[i];
    const qs = allQuizzes[ci].questions || [];
    const k = Math.min(target[i], qs.length);
    picked = picked.concat(pickRandom(qs, k));
  }

  if (picked.length < total) {
    const pool = chapters.flatMap(ci => allQuizzes[ci].questions || []);
    const key = q => (q._id ?? "") + "|" + (q.text ?? "");
    const seen = new Set(picked.map(key));
    const rest = pool.filter(q => !seen.has(key(q)));
    picked = picked.concat(pickRandom(rest, total - picked.length));
  }

  shuffleInPlace(picked);

  const title = `${EXAM_TITLE_PREFIX} (${picked.length} câu)`;
  return {
    title,
    timeLimit: 0,
    questions: picked.map((q, i) => ({
      ...q,
      _id: q._id ?? i
    }))
  };
}
