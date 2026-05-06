#!/usr/bin/env node
import assert from 'node:assert/strict';
import { reviewQuizDraftQuality } from '../src/data/quizDraftQuality.js';
import { parseTextQuizDraft } from '../src/data/textQuizParser.js';
import { validateLearningDataImport } from '../src/data/importValidator.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCodes(review) {
  return new Set(review.warnings.map(warning => warning.code));
}

function assertHasCode(review, code, message) {
  assert.ok(getCodes(review).has(code), message || `Expected warning code ${code}`);
}

function assertNoCode(review, code, message) {
  assert.ok(!getCodes(review).has(code), message || `Did not expect warning code ${code}`);
}

function buildCleanDraft() {
  return {
    subjects: [{ id: 'networking', title: 'Mạng máy tính' }],
    topics: [{ id: 'networking-osi', subjectId: 'networking', title: 'Mô hình OSI' }],
    items: [
      {
        id: 'mc-1',
        type: 'multiple_choice',
        subjectId: 'networking',
        topicId: 'networking-osi',
        prompt: 'Application layer thuộc mô hình nào trong kiến thức mạng máy tính?',
        choices: [
          { id: 'A', text: 'OSI' },
          { id: 'B', text: 'TCP/IP' },
          { id: 'C', text: 'DNS' }
        ],
        correctAnswer: 'A',
        explanation: 'Application là tầng 7 trong mô hình OSI.'
      },
      {
        id: 'sa-1',
        type: 'short_answer',
        subjectId: 'networking',
        topicId: 'networking-osi',
        prompt: 'TCP hoạt động ở tầng nào trong mô hình TCP/IP?',
        answer: 'Transport'
      },
      {
        id: 'fc-1',
        type: 'flashcard',
        subjectId: 'networking',
        topicId: 'networking-osi',
        front: 'Private IP 10.0.0.0/8 là gì?',
        back: 'Một dải địa chỉ IPv4 private dùng trong mạng nội bộ.'
      }
    ]
  };
}

function run() {
  const cleanDraft = buildCleanDraft();
  const cleanBefore = clone(cleanDraft);
  const cleanReview = reviewQuizDraftQuality(cleanDraft);
  assert.deepEqual(cleanDraft, cleanBefore, 'quality review must not mutate input draft');
  assert.equal(cleanReview.summary.errorCount, 0, 'clean draft should have no quality errors');
  assert.equal(cleanReview.summary.advisoryWarningCount, 0, 'clean draft should have no warning-level issues');

  const duplicateChoiceDraft = buildCleanDraft();
  duplicateChoiceDraft.items[0].choices[1].text = 'OSI';
  assertHasCode(reviewQuizDraftQuality(duplicateChoiceDraft), 'duplicate_choices', 'duplicate choices should be detected');

  const duplicateChoiceIdDraft = buildCleanDraft();
  duplicateChoiceIdDraft.items[0].choices = [
    { id: 'A', text: 'Lựa chọn 1' },
    { id: 'A', text: 'Lựa chọn 2' },
    { id: 'B', text: 'Lựa chọn 3' }
  ];
  const duplicateChoiceIdBefore = clone(duplicateChoiceIdDraft);
  const duplicateChoiceIdReview = reviewQuizDraftQuality(duplicateChoiceIdDraft);
  assert.deepEqual(duplicateChoiceIdDraft, duplicateChoiceIdBefore, 'duplicate choice id review must not mutate input');
  assertHasCode(duplicateChoiceIdReview, 'duplicate_choice_ids', 'duplicate choice ids should be detected');
  assertNoCode(duplicateChoiceIdReview, 'duplicate_choices', 'different choice text should not require duplicate text warning');

  const duplicateChoiceIdCaseDraft = buildCleanDraft();
  duplicateChoiceIdCaseDraft.items[0].choices = [
    { id: ' A ', text: 'Lựa chọn 1' },
    { id: 'a', text: 'Lựa chọn 2' },
    { id: 'B', text: 'Lựa chọn 3' }
  ];
  assertHasCode(reviewQuizDraftQuality(duplicateChoiceIdCaseDraft), 'duplicate_choice_ids', 'duplicate choice ids should be compared after trim/case normalization');

  const answerMismatchDraft = buildCleanDraft();
  answerMismatchDraft.items[0].correctAnswer = 'Z';
  const mismatchReview = reviewQuizDraftQuality(answerMismatchDraft);
  assertHasCode(mismatchReview, 'answer_not_in_choices', 'answer mismatch should be detected');
  assert.ok(mismatchReview.warnings.some(warning => warning.code === 'answer_not_in_choices' && warning.level === 'error'), 'answer mismatch should be an error-level quality issue');

  const tooFewChoicesDraft = buildCleanDraft();
  tooFewChoicesDraft.items[0].choices = [{ id: 'A', text: 'OSI' }];
  assertHasCode(reviewQuizDraftQuality(tooFewChoicesDraft), 'too_few_choices', 'too few choices should be detected');

  const flashcardMissingSideDraft = buildCleanDraft();
  flashcardMissingSideDraft.items[2].back = '';
  assertHasCode(reviewQuizDraftQuality(flashcardMissingSideDraft), 'flashcard_missing_back', 'missing flashcard back should be detected');

  const shortAnswerMissingDraft = buildCleanDraft();
  shortAnswerMissingDraft.items[1].answer = '';
  assertHasCode(reviewQuizDraftQuality(shortAnswerMissingDraft), 'short_answer_missing_answer', 'missing short answer should be detected');

  const defaultContextDraft = buildCleanDraft();
  defaultContextDraft.subjects[0].title = 'Nội dung đã dán';
  defaultContextDraft.topics[0].title = 'Tổng quan';
  const defaultContextReview = reviewQuizDraftQuality(defaultContextDraft);
  assertHasCode(defaultContextReview, 'default_subject', 'default subject should be advisory');
  assertHasCode(defaultContextReview, 'default_topic', 'default topic should be advisory');

  const veryFewDraft = buildCleanDraft();
  veryFewDraft.items = veryFewDraft.items.slice(0, 1);
  assertHasCode(reviewQuizDraftQuality(veryFewDraft), 'very_few_items', 'very small drafts should be flagged');

  const parsed = parseTextQuizDraft(`Môn: Mạng máy tính\nChủ đề: OSI\n\nCâu hỏi: Application layer thuộc mô hình nào?\nA. OSI\nB. TCP/IP\nC. DNS\nĐáp án: A\nGiải thích: Application là tầng trong mô hình OSI.\n\nCâu hỏi ngắn: TCP hoạt động ở tầng nào?\nĐáp án: Transport\n\nFlashcard:\nMặt trước: Private IP 10.0.0.0/8 là gì?\nMặt sau: Một dải địa chỉ IPv4 private.`);
  assert.equal(parsed.validation.canImport, true, 'parseTextQuizDraft output should still pass import validation');
  const parsedReview = reviewQuizDraftQuality(parsed.rawData);
  assert.ok(Array.isArray(parsedReview.warnings), 'parsed draft quality review should return warnings array');
  assertNoCode(parsedReview, 'draft_empty', 'parsed draft should not be empty');

  const validImportReview = validateLearningDataImport(cleanDraft);
  assert.equal(validImportReview.canImport, true, 'valid quality test draft should pass existing import validator');

  console.log('[validate-quiz-draft-quality] all checks passed');
}

run();
