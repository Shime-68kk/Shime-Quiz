import { isAnswerCorrect } from "./scoring.js";
import { strip } from "../utils/helpers.js";

const normalizedQuestionCache = new WeakMap();

function questionCategoryText(question = {}) {
  return [
    question.chapter,
    question.category,
    question.section,
    question.topic,
    question.group,
    question.tag,
    Array.isArray(question.tags) ? question.tags.join(" ") : ""
  ].filter(Boolean).join(" ");
}

function buildQuestionSearchText(question = {}) {
  return strip([
    question.text,
    question.explanation,
    questionCategoryText(question),
    Array.isArray(question.choices) ? question.choices.join(" ") : ""
  ].filter(Boolean).join(" "));
}

function getQuestionSearchText(question = {}) {
  if (!question || typeof question !== "object") return "";

  const cached = normalizedQuestionCache.get(question);
  if (cached != null) return cached;

  const text = buildQuestionSearchText(question);
  normalizedQuestionCache.set(question, text);
  return text;
}

export function buildSearchIndex(quizzes) {
  return quizzes.map(qz => ({
    titleN: strip(qz.title || ""),
    q: (qz.questions || []).map(qq => ({
      textN: getQuestionSearchText(qq)
    }))
  }));
}

export function questionMatches({ searchIndex, searchKeywordN, qzIndex, questionIndex, question = null }) {
  const k = searchKeywordN;
  if (!k) return true;

  if (question) return getQuestionSearchText(question).includes(k);

  const qi = searchIndex[qzIndex]?.q?.[questionIndex];
  if (!qi) return true;

  return qi.textN.includes(k);
}

export function shouldShowQuestion({
  question,
  answer,
  questionFilter,
  canShowWrong,
  searchIndex,
  searchKeywordN,
  currentQuizIndex,
  questionIndex,
  isWrongHistory = false,
  isDueReview = false
}) {
  let show = true;

  if (questionFilter === "bookmark") {
    show = !!question.bookmarked;
  } else if (questionFilter === "wrong") {
    show = (answer !== null) && canShowWrong && (!isAnswerCorrect(question, answer));
  } else if (questionFilter === "wrongHistory") {
    show = Boolean(isWrongHistory);
  } else if (questionFilter === "dueReview") {
    show = Boolean(isDueReview);
  } else if (questionFilter === "unanswered") {
    show = answer === null || (Array.isArray(answer) && answer.length === 0) || answer === "";
  }

  if (show && searchKeywordN) {
    show = questionMatches({
      searchIndex,
      searchKeywordN,
      qzIndex: currentQuizIndex,
      questionIndex,
      question
    });
  }

  return show;
}
