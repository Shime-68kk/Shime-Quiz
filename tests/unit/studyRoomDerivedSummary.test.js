import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createStudyRoomDerivedSafeCapsule,
  createStudyRoomDerivedSummaryDiagnostics,
  validateStudyRoomDerivedSummaryInput
} from '../../src/deviceBridge/studyRoomDerivedSummary.js';
import { validateSafeLearningCapsule } from '../../src/deviceBridge/safeLearningCapsule.js';

const SAFE_INPUT = {
  correctCount: 8,
  incorrectCount: 2,
  skippedCount: 0,
  totalCount: 10,
  sessionDurationBucket: 'medium',
  recentAccuracyBucket: 'high',
  dueReviewCountBucket: 'low',
  consecutiveErrorsBucket: 'none',
  hesitationBucket: 'low',
  focusNeedSignalBucket: 'low',
  userEnergySelfReportBucket: 'medium',
  monotonicImportId: 22
};

describe('studyRoomDerivedSummary', () => {
  it('creates a valid safe capsule from coarse StudyRoom counters only', () => {
    const result = createStudyRoomDerivedSafeCapsule(SAFE_INPUT, { createdAtBucket: '2026-07-07' });

    expect(result.ok).toBe(true);
    expect(validateSafeLearningCapsule(result.capsule).ok).toBe(true);
    expect(result.capsule.sourceType).toBe('shime_quiz_studyroom');
    expect(result.capsule.safeSummaryCode).toBe('STEADY_PROGRESS');
  });

  it('rejects deeply nested forbidden raw quiz fields', () => {
    const result = validateStudyRoomDerivedSummaryInput({
      ...SAFE_INPUT,
      nested: { card: { prompt: 'private prompt', correctAnswer: 'private answer' } }
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map(issue => issue.category)).toContain('forbidden_raw_field');
    expect(JSON.stringify(createStudyRoomDerivedSummaryDiagnostics(result))).not.toMatch(/private prompt|private answer/);
  });

  it('rejects RF identifiers, secrets, settings, history, and raw document text', () => {
    const result = validateStudyRoomDerivedSummaryInput({
      ...SAFE_INPUT,
      extra: {
        ssid: 'HomeNetwork',
        bssid: 'aa:bb:cc:dd:ee:ff',
        token: 'secret-token',
        settings: { theme: 'dark' },
        studyHistory: [],
        importedDocumentText: 'raw document'
      }
    });

    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(4);
    expect(JSON.stringify(createStudyRoomDerivedSummaryDiagnostics(result))).not.toMatch(/HomeNetwork|secret-token|raw document/);
  });

  it('rejects malformed and inconsistent counter input', () => {
    expect(validateStudyRoomDerivedSummaryInput(null).ok).toBe(false);
    expect(validateStudyRoomDerivedSummaryInput([]).ok).toBe(false);
    expect(validateStudyRoomDerivedSummaryInput({ ...SAFE_INPUT, correctCount: 11 }).ok).toBe(false);
  });

  it('source does not use storage, network, or live transport APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/studyRoomDerivedSummary.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.serial|navigator\.bluetooth|mqtt/i);
  });
});
