/**
 * Phase 15C — Dashboard Mixed Scheduler Due Count
 *
 * 14 tests:
 *  1–3:   due count includes SM-2, fsrs-planned, and fsrs-active records
 *  4:     no double-counting when same itemId appears twice
 *  5–6:   future/not-due records are excluded
 *  7–8:   malformed due date and unknown schedulerKind do not crash
 *  9–10:  copy policy — no mixed-scheduler note when Y=0; note is experimental when Y>0
 *  11–14: static source assertions (no .next(), StudyRoom unchanged, double-gate intact, no package changes)
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { computeMixedSchedulerDueSummary } from '../../src/quiz/reviewSchedulerAdapter.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PAST = new Date('2026-05-01T00:00:00.000Z');
const NOW  = new Date('2026-05-15T12:00:00.000Z');
const FUTURE = new Date('2026-06-01T00:00:00.000Z');

function sm2Record(overrides = {}) {
  return {
    itemId: 'sm2-item-1',
    dueAt: PAST.toISOString(),
    intervalDays: 1,
    ...overrides
  };
}

function fsrsPlannedRecord(overrides = {}) {
  return {
    itemId: 'fsrs-planned-item-1',
    schedulerKind: 'fsrs-planned',
    schedulerVersion: 'fsrs-planned-v1',
    dueAt: PAST.toISOString(),
    fsrsPayload: { state: 'New', stability: 1.0, difficulty: 5.0, reps: 0 },
    ...overrides
  };
}

function fsrsActiveRecord(overrides = {}) {
  return {
    itemId: 'fsrs-active-item-1',
    schedulerKind: 'fsrs-active',
    schedulerVersion: 'phase15b-active-scheduling',
    dueAt: PAST.toISOString(),
    fsrsPayload: { state: 'Review', stability: 3.5, difficulty: 4.8, reps: 2 },
    ...overrides
  };
}

// ─── Tests 1–3: mixed-family due counting ─────────────────────────────────────

describe('Test 1: Dashboard due count includes normal SM-2 due records', () => {
  it('SM-2 due record contributes to dueCount', () => {
    const result = computeMixedSchedulerDueSummary([sm2Record()], NOW);
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(0);
  });
});

describe('Test 2: Dashboard due count includes fsrs-planned due records', () => {
  it('fsrs-planned due record counted in dueCount and fsrsFamilyDueCount', () => {
    const result = computeMixedSchedulerDueSummary([fsrsPlannedRecord()], NOW);
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(1);
    expect(result.hasFsrsFamily).toBe(true);
  });
});

describe('Test 3: Dashboard due count includes fsrs-active due records', () => {
  it('fsrs-active due record counted in both dueCount and fsrsFamilyDueCount', () => {
    const result = computeMixedSchedulerDueSummary([fsrsActiveRecord()], NOW);
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(1);
    expect(result.hasFsrsFamily).toBe(true);
  });
});

// ─── Test 4: no double-counting ───────────────────────────────────────────────

describe('Test 4: Dashboard does not double-count records with the same itemId', () => {
  it('duplicate itemId counted only once', () => {
    const dup = fsrsPlannedRecord({ itemId: 'shared-item' });
    const result = computeMixedSchedulerDueSummary([dup, { ...dup }], NOW);
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(1);
  });
});

// ─── Tests 5–6: future records excluded ───────────────────────────────────────

describe('Test 5: Future/not-due SM-2 records are excluded from due count', () => {
  it('SM-2 record with future dueAt not counted', () => {
    const result = computeMixedSchedulerDueSummary(
      [sm2Record({ itemId: 'future-sm2', dueAt: FUTURE.toISOString() })],
      NOW
    );
    expect(result.dueCount).toBe(0);
  });
});

describe('Test 6: Future/not-due fsrs-active records are excluded from due count', () => {
  it('fsrs-active record with future dueAt not counted', () => {
    const result = computeMixedSchedulerDueSummary(
      [fsrsActiveRecord({ itemId: 'future-fsrs-active', dueAt: FUTURE.toISOString() })],
      NOW
    );
    expect(result.dueCount).toBe(0);
    expect(result.fsrsFamilyDueCount).toBe(0);
    expect(result.hasFsrsFamily).toBe(true);
  });
});

// ─── Tests 7–8: edge cases ────────────────────────────────────────────────────

describe('Test 7: Malformed due date does not crash Dashboard', () => {
  it('record with invalid dueAt is skipped gracefully', () => {
    const records = [
      sm2Record({ itemId: 'bad-date', dueAt: 'not-a-date' }),
      sm2Record({ itemId: 'good', dueAt: PAST.toISOString() })
    ];
    let result;
    expect(() => { result = computeMixedSchedulerDueSummary(records, NOW); }).not.toThrow();
    expect(result.dueCount).toBe(1);
  });
});

describe('Test 8: Unknown schedulerKind does not crash Dashboard', () => {
  it('unknown schedulerKind is treated as current-scheduler (SM-2)', () => {
    const records = [
      { itemId: 'unknown-kind', schedulerKind: 'future-scheduler-v9', dueAt: PAST.toISOString() }
    ];
    let result;
    expect(() => { result = computeMixedSchedulerDueSummary(records, NOW); }).not.toThrow();
    expect(result.dueCount).toBe(1);
    expect(result.fsrsFamilyDueCount).toBe(0);
  });
});

// ─── Tests 9–10: copy policy ──────────────────────────────────────────────────

describe('Test 9: No FSRS-family records → no mixed-scheduler copy shown', () => {
  it('fsrsFamilyDueCount is 0 when no FSRS-family records exist', () => {
    const result = computeMixedSchedulerDueSummary(
      [sm2Record(), sm2Record({ itemId: 'sm2-b', dueAt: PAST.toISOString() })],
      NOW
    );
    expect(result.fsrsFamilyDueCount).toBe(0);
    expect(result.hasFsrsFamily).toBe(false);
  });

  it('Dashboard source does not show note when fsrsFamilyDueCount is 0 (MixedSchedulerDueNote returns null)', () => {
    const dashSource = fs.readFileSync('src/routes/Dashboard.jsx', 'utf8');
    expect(dashSource).toContain('if (summary.fsrsFamilyDueCount === 0) return null');
  });
});

describe('Test 10: FSRS-family due records → copy is experimental/narrow, no overclaim', () => {
  it('fsrsFamilyDueCount > 0 when FSRS-family due records exist', () => {
    const result = computeMixedSchedulerDueSummary(
      [sm2Record(), fsrsPlannedRecord({ itemId: 'fp1' }), fsrsActiveRecord({ itemId: 'fa1' })],
      NOW
    );
    expect(result.dueCount).toBe(3);
    expect(result.fsrsFamilyDueCount).toBe(2);
  });

  it('Dashboard copy uses "experimental" and does not contain forbidden overclaims', () => {
    const dashSource = fs.readFileSync('src/routes/Dashboard.jsx', 'utf8').toLowerCase();
    expect(dashSource).toContain('thử nghiệm');
    expect(dashSource).toContain('experimental');
    expect(dashSource).not.toContain('fsrs is now active for everyone');
    expect(dashSource).not.toContain('ai scheduling is enabled');
    expect(dashSource).not.toContain('cloud sync enabled');
    expect(dashSource).not.toContain('guaranteed better');
    expect(dashSource).not.toContain('dashboard fully supports every future scheduler');
    expect(dashSource).not.toContain('fsrsactiveschedulingenabled');
  });
});

// ─── Tests 11–14: static source assertions ────────────────────────────────────

describe('Test 11: Dashboard source does not call ts-fsrs.next()', () => {
  it('Dashboard.jsx has no .next() call', () => {
    const source = fs.readFileSync('src/routes/Dashboard.jsx', 'utf8');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });
});

describe('Test 12: StudyRoom source is unchanged from Phase 14N', () => {
  it('StudyRoom.jsx still contains shouldShowFsrsTwoStepBridge and appendFsrsReviewLog', () => {
    const source = fs.readFileSync('src/routes/StudyRoom.jsx', 'utf8');
    expect(source).toContain('shouldShowFsrsTwoStepBridge');
    expect(source).toContain('appendFsrsReviewLog');
    expect(source).toContain('FsrsProductionMemoryRatingBridge');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });
});

describe('Test 13: Active scheduling double-gate source remains intact from Phase 15B', () => {
  it('reviewSchedulerAdapter.js preserves Phase 15B double-gate and computeMixedSchedulerDueSummary', () => {
    const source = fs.readFileSync('src/quiz/reviewSchedulerAdapter.js', 'utf8');
    expect(source).toContain('fsrsExperimentalEnabled');
    expect(source).toContain('fsrsActiveSchedulingEnabled');
    expect(source).toContain('export function scheduleActiveFsrsOrFallback');
    expect(source).toContain('export function computeMixedSchedulerDueSummary');
    expect(/\.next\s*\(/.test(source)).toBe(false);
  });
});

describe('Test 14: No package/dependency changes', () => {
  it('package.json ts-fsrs remains pinned at 5.3.3', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies?.['ts-fsrs']).toBe('5.3.3');
  });

  it('package.json and package-lock.json do not reference native binding', () => {
    const bindingStr = '@open-spaced-repetition/binding';
    const pkgText = fs.readFileSync('package.json', 'utf8');
    const lockText = fs.readFileSync('package-lock.json', 'utf8');
    expect(pkgText).not.toContain(bindingStr.split('/')[1]);
    expect(lockText).not.toContain(bindingStr.split('/')[1]);
  });
});
