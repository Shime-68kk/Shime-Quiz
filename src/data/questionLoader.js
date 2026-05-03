export async function loadBundledQuizData(url = "data.json") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cannot load ${url}: HTTP ${response.status}`);
  return normalizeQuizData(await response.json());
}

export function parseQuizJsonText(text) {
  let data = JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  return normalizeQuizData(data);
}

export function normalizeQuizData(data) {
  if (data && !Array.isArray(data) && Array.isArray(data.quizzes)) return data.quizzes;
  if (data && !Array.isArray(data) && Array.isArray(data.data)) return data.data;
  return data;
}
