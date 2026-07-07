import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  computeSafeLearningCapsuleChecksum,
  createSafeLearningCapsule,
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from '../../src/deviceBridge/safeLearningCapsule.js';

const FIXTURE_DIR = path.join(process.cwd(), 'tests/fixtures/safe-learning-capsule');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

function issueCodes(result) {
  return result.issues.map(issue => issue.code);
}

describe('safeLearningCapsule', () => {
  it('accepts a valid safe capsule fixture', () => {
    const capsule = readFixture('valid-safe-capsule.json');
    const result = validateSafeLearningCapsule(capsule);

    expect(result).toEqual({ ok: true, error: null, issues: [] });
    expect(Object.keys(capsule).sort()).toEqual([...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort());
  });

  it('matches robot checksum rule checksum32(capsuleId|sourceType|safeSummaryCode)', () => {
    const capsule = readFixture('valid-safe-capsule.json');

    expect(computeSafeLearningCapsuleChecksum(capsule)).toBe(capsule.checksum);

    const created = createSafeLearningCapsule({
      capsuleId: 'capsule_robot_rule_0001',
      sourceType: 'mock_import',
      createdAtBucket: '2026-07-07',
      monotonicImportId: 42,
      learningStateBucket: 'steady',
      studyLoadBucket: 'normal',
      reviewUrgencyBucket: 'medium',
      sessionMoodBucket: 'calm',
      sessionEnergyBucket: 'medium',
      focusNeedBucket: 'low',
      recommendedCompanionAction: 'review_due',
      companionTone: 'focused',
      safeSummaryCode: 'REVIEW_SOON',
      expirationBucket: 'same_day'
    });

    expect(created.ok).toBe(true);
    expect(created.capsule.checksum).toBe(computeSafeLearningCapsuleChecksum(created.capsule));
  });

  it('rejects raw quiz and app study fields', () => {
    const result = validateSafeLearningCapsule(readFixture('invalid-raw-quiz-fields.json'));

    expect(result.ok).toBe(false);
    expect(issueCodes(result)).toContain('unknown_capsule_field');
    expect(issueCodes(result)).toContain('forbidden_capsule_field');
  });

  it('rejects raw RF identifiers', () => {
    const result = validateSafeLearningCapsule(readFixture('invalid-raw-rf-identifiers.json'));

    expect(result.ok).toBe(false);
    expect(issueCodes(result)).toContain('forbidden_capsule_field');
  });

  it('rejects secrets and credentials', () => {
    const result = validateSafeLearningCapsule(readFixture('invalid-secret-credential-fields.json'));

    expect(result.ok).toBe(false);
    expect(issueCodes(result)).toContain('forbidden_capsule_field');
  });

  it('rejects unknown fields', () => {
    const result = validateSafeLearningCapsule(readFixture('invalid-unknown-fields.json'));

    expect(result.ok).toBe(false);
    expect(issueCodes(result)).toContain('unknown_capsule_field');
  });

  it('rejects invalid checksum', () => {
    const result = validateSafeLearningCapsule(readFixture('invalid-checksum.json'));

    expect(result.ok).toBe(false);
    expect(issueCodes(result)).toContain('checksum_mismatch');
  });

  it('rejects malformed input', () => {
    expect(validateSafeLearningCapsule(null).ok).toBe(false);
    expect(validateSafeLearningCapsule([]).ok).toBe(false);
    expect(validateSafeLearningCapsule('not-json').ok).toBe(false);
    expect(createSafeLearningCapsule('not-object').ok).toBe(false);
  });

  it('does not export raw user study content from created capsules', () => {
    const created = createSafeLearningCapsule({
      capsuleId: 'capsule_safe_no_raw_0001',
      sourceType: 'shime_quiz_app',
      createdAtBucket: '2026-07-07',
      monotonicImportId: 7,
      learningStateBucket: 'building',
      studyLoadBucket: 'light',
      reviewUrgencyBucket: 'low',
      sessionMoodBucket: 'calm',
      sessionEnergyBucket: 'medium',
      focusNeedBucket: 'medium',
      recommendedCompanionAction: 'encourage',
      companionTone: 'warm',
      safeSummaryCode: 'STEADY_PROGRESS',
      expirationBucket: 'same_session',
      prompt: 'What is private?',
      correctAnswer: 'private answer',
      studyHistory: [{ itemId: 'card_private_1' }]
    });

    expect(created.ok).toBe(true);
    const capsuleText = JSON.stringify(created.capsule);
    expect(capsuleText).not.toMatch(/prompt|question|answer|correctAnswer|userAnswer|studyHistory|card_private|private answer/i);
  });

  it('source does not reference storage, network, transport, or device APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/safeLearningCapsule.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
  });
});
