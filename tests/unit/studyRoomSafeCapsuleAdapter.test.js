import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  computeSafeLearningCapsuleChecksum,
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from '../../src/deviceBridge/safeLearningCapsule.js';
import {
  createStudyRoomSafeLearningCapsule,
  validateStudyRoomSafeSummaryInput
} from '../../src/deviceBridge/studyRoomSafeCapsuleAdapter.js';

const FIXTURE_DIR = path.join(process.cwd(), 'tests/fixtures/safe-learning-capsule-adapter');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

function issueCategories(result) {
  return result.issues.map(issue => issue.category);
}

function issueCodes(result) {
  return result.issues.map(issue => issue.code);
}

describe('studyRoomSafeCapsuleAdapter', () => {
  it('derived steady session exports valid safe capsule', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-steady-session.json'));

    expect(result.ok).toBe(true);
    expect(validateSafeLearningCapsule(result.capsule).ok).toBe(true);
    expect(result.capsule).toMatchObject({
      sourceType: 'shime_quiz_studyroom',
      createdAtBucket: '2026-07-07',
      learningStateBucket: 'steady',
      studyLoadBucket: 'light',
      reviewUrgencyBucket: 'low',
      sessionMoodBucket: 'calm',
      recommendedCompanionAction: 'quiet_presence',
      companionTone: 'calm',
      safeSummaryCode: 'STEADY_PROGRESS',
      privacyClass: 'redacted_coarse_only'
    });
  });

  it('struggling session maps to gentle companion action', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-struggling-session.json'));

    expect(result.ok).toBe(true);
    expect(result.capsule).toMatchObject({
      learningStateBucket: 'struggling',
      recommendedCompanionAction: 'encourage_break_or_review',
      companionTone: 'gentle',
      safeSummaryCode: 'NEEDS_GENTLE_SUPPORT'
    });
  });

  it('high review pressure maps to review urgency high', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-high-review-pressure.json'));

    expect(result.ok).toBe(true);
    expect(result.capsule).toMatchObject({
      reviewUrgencyBucket: 'high',
      recommendedCompanionAction: 'suggest_review_focus',
      safeSummaryCode: 'REVIEW_SOON'
    });
  });

  it('low energy long session maps to rest or light review', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-low-energy-long-session.json'));

    expect(result.ok).toBe(true);
    expect(result.capsule).toMatchObject({
      studyLoadBucket: 'heavy',
      sessionEnergyBucket: 'low',
      focusNeedBucket: 'rest_or_light_review',
      recommendedCompanionAction: 'encourage_break_or_review',
      safeSummaryCode: 'HIGH_LOAD_BREAK_SUGGESTED'
    });
  });

  it('checksum matches APP-H1 and robot rule', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-steady-session.json'));

    expect(result.ok).toBe(true);
    expect(result.capsule.checksum).toBe(computeSafeLearningCapsuleChecksum(result.capsule));
  });

  it('output contains only APP-H1 allowed capsule fields', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-steady-session.json'));

    expect(Object.keys(result.capsule).sort()).toEqual([...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort());
  });

  it('monotonicImportId is safe and capsuleId does not equal raw session bucket', () => {
    const input = readFixture('derived-steady-session.json');
    const result = createStudyRoomSafeLearningCapsule(input);

    expect(result.ok).toBe(true);
    expect(result.capsule.monotonicImportId).toBe(input.monotonicImportId);
    expect(result.capsule.capsuleId).not.toBe(input.sessionIdBucket);
    expect(result.capsule.capsuleId).toMatch(/^studyroom_capsule_[a-f0-9]{8}$/);
  });

  it.each([
    ['invalid-raw-question-input.json', 'app_quiz_field'],
    ['invalid-raw-answer-input.json', 'app_quiz_field'],
    ['invalid-study-history-input.json', 'app_history_field'],
    ['invalid-source-metadata-input.json', 'raw_identifier'],
    ['invalid-document-text-input.json', 'document_text_field'],
    ['invalid-card-id-input.json', 'raw_identifier'],
    ['invalid-rf-identifier-input.json', 'rf_identifier'],
    ['invalid-secret-input.json', 'credential_or_secret'],
    ['invalid-unknown-field-input.json', 'unknown_unsafe_field']
  ])('rejects unsafe input fixture %s', (fixtureName, expectedCategory) => {
    const result = createStudyRoomSafeLearningCapsule(readFixture(fixtureName));

    expect(result.ok).toBe(false);
    expect(issueCategories(result)).toContain(expectedCategory);
  });

  it('rejects correctAnswer, explanation, userAnswer, settings, raw logs, deck IDs, and MAC-like values', () => {
    const base = readFixture('derived-steady-session.json');
    const cases = [
      [{ ...base, correctAnswer: 'private' }, 'app_quiz_field'],
      [{ ...base, explanation: 'private' }, 'app_quiz_field'],
      [{ ...base, userAnswer: 'private' }, 'app_quiz_field'],
      [{ ...base, settings: { private: true } }, 'app_history_field'],
      [{ ...base, rawFsrsLogs: [] }, 'app_history_field'],
      [{ ...base, deckId: 'deck_private' }, 'raw_identifier'],
      [{ ...base, focusNeedSignalBucket: 'aa:bb:cc:dd:ee:ff' }, 'rf_identifier']
    ];

    cases.forEach(([input, category]) => {
      const result = createStudyRoomSafeLearningCapsule(input);
      expect(result.ok).toBe(false);
      expect(issueCategories(result)).toContain(category);
    });
  });

  it('rejects malformed summary input', () => {
    expect(validateStudyRoomSafeSummaryInput(null).ok).toBe(false);
    expect(validateStudyRoomSafeSummaryInput([]).ok).toBe(false);
    expect(validateStudyRoomSafeSummaryInput('not-object').ok).toBe(false);
    expect(issueCodes(createStudyRoomSafeLearningCapsule({ nowBucket: 'day_bucket_2026_07_07' }))).toContain('invalid_session_id_bucket');
  });

  it('diagnostics do not echo raw values', () => {
    const rawValue = 'private raw answer should not echo';
    const result = createStudyRoomSafeLearningCapsule({
      ...readFixture('derived-steady-session.json'),
      answer: rawValue
    });

    expect(result.ok).toBe(false);
    expect(JSON.stringify(result.issues)).not.toContain(rawValue);
  });

  it('does not export raw user study content or per-card IDs', () => {
    const result = createStudyRoomSafeLearningCapsule(readFixture('derived-steady-session.json'));
    const text = JSON.stringify(result.capsule);

    expect(text).not.toMatch(/prompt|question|answer|correctAnswer|explanation|userAnswer|studyHistory|sourceMetadata|itemId|cardId|deckId|perCardId/i);
  });

  it('adapter source does not call network, storage, transport, or live device APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/studyRoomSafeCapsuleAdapter.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|mqtt/i);
    expect(source).not.toMatch(/new\s+DeviceBridge|StudyRoom\.jsx/i);
  });
});
