/**
 * tests/unit/fsrsTwoStepScaffold.test.jsx
 *
 * Phase 14I — FSRS Two-Step Scaffold unit tests.
 *
 * DOM/component rendering is not available (no jsdom vitest environment configured).
 * Tests cover:
 *   1. Pure state machine transitions (exported functions)
 *   2. Static assertions about fixture component source
 *   3. Static isolation checks for StudyRoom, adapter, scheduler
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  INITIAL_STATE,
  MOCK_CARD_ID,
  revealAnswer,
  reset,
  selectObjective,
  selectRating
} from '../../src/components/study/FsrsTwoStepScaffold.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// 1. State machine — initial state
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — initial state', () => {
  it('INITIAL_STATE.phase is question', () => {
    expect(INITIAL_STATE.phase).toBe('question');
  });

  it('INITIAL_STATE.objective is null', () => {
    expect(INITIAL_STATE.objective).toBeNull();
  });

  it('INITIAL_STATE.memoryRating is null', () => {
    expect(INITIAL_STATE.memoryRating).toBeNull();
  });

  it('INITIAL_STATE.log is null', () => {
    expect(INITIAL_STATE.log).toBeNull();
  });

  it('MOCK_CARD_ID is a non-empty string', () => {
    expect(typeof MOCK_CARD_ID).toBe('string');
    expect(MOCK_CARD_ID.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. State machine — reveal answer shows objective correctness step
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — reveal answer', () => {
  it('revealAnswer transitions phase from question to objective', () => {
    const next = revealAnswer(INITIAL_STATE);
    expect(next.phase).toBe('objective');
  });

  it('revealAnswer preserves other state fields', () => {
    const next = revealAnswer(INITIAL_STATE);
    expect(next.objective).toBeNull();
    expect(next.memoryRating).toBeNull();
    expect(next.log).toBeNull();
  });

  it('revealAnswer is a no-op if phase is not question', () => {
    const objectiveState = { ...INITIAL_STATE, phase: 'objective' };
    const next = revealAnswer(objectiveState);
    expect(next.phase).toBe('objective');
  });
});

// ---------------------------------------------------------------------------
// 3. State machine — wrong path: auto-assigns Again, never reaches effort
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — wrong path (Again)', () => {
  const objectiveState = revealAnswer(INITIAL_STATE);

  it('selectObjective wrong sets phase to result', () => {
    const next = selectObjective(objectiveState, 'wrong');
    expect(next.phase).toBe('result');
  });

  it('selectObjective wrong auto-assigns memoryRating Again', () => {
    const next = selectObjective(objectiveState, 'wrong');
    expect(next.memoryRating).toBe('Again');
  });

  it('selectObjective wrong records objective as wrong', () => {
    const next = selectObjective(objectiveState, 'wrong');
    expect(next.objective).toBe('wrong');
  });

  it('selectObjective wrong never transitions to effort phase', () => {
    const next = selectObjective(objectiveState, 'wrong');
    expect(next.phase).not.toBe('effort');
  });

  it('selectObjective wrong emits fixture log with rating Again', () => {
    const next = selectObjective(objectiveState, 'wrong');
    expect(next.log).not.toBeNull();
    expect(next.log.rating).toBe('Again');
    expect(next.log.objective).toBe('wrong');
    expect(next.log.cardId).toBe(MOCK_CARD_ID);
  });

  it('selectObjective wrong does not allow subsequent selectRating call to change rating', () => {
    const wrongResult = selectObjective(objectiveState, 'wrong');
    // selectRating is a no-op unless phase is effort
    const attempted = selectRating(wrongResult, 'Hard');
    expect(attempted.memoryRating).toBe('Again');
    expect(attempted.phase).toBe('result');
  });
});

// ---------------------------------------------------------------------------
// 4. State machine — right path: transitions to effort, shows Hard/Good/Easy
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — right path', () => {
  const objectiveState = revealAnswer(INITIAL_STATE);

  it('selectObjective right sets phase to effort', () => {
    const next = selectObjective(objectiveState, 'right');
    expect(next.phase).toBe('effort');
  });

  it('selectObjective right does not assign memoryRating yet', () => {
    const next = selectObjective(objectiveState, 'right');
    expect(next.memoryRating).toBeNull();
  });

  it('selectObjective right records objective as right', () => {
    const next = selectObjective(objectiveState, 'right');
    expect(next.objective).toBe('right');
  });

  it('selectObjective right does not set log yet', () => {
    const next = selectObjective(objectiveState, 'right');
    expect(next.log).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. State machine — Hard selection records Hard
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — Hard rating', () => {
  const effortState = selectObjective(revealAnswer(INITIAL_STATE), 'right');

  it('selectRating Hard sets memoryRating to Hard', () => {
    const next = selectRating(effortState, 'Hard');
    expect(next.memoryRating).toBe('Hard');
  });

  it('selectRating Hard transitions to result phase', () => {
    const next = selectRating(effortState, 'Hard');
    expect(next.phase).toBe('result');
  });

  it('selectRating Hard emits log with rating Hard', () => {
    const next = selectRating(effortState, 'Hard');
    expect(next.log).not.toBeNull();
    expect(next.log.rating).toBe('Hard');
    expect(next.log.objective).toBe('right');
    expect(next.log.cardId).toBe(MOCK_CARD_ID);
  });
});

// ---------------------------------------------------------------------------
// 6. State machine — Good selection records Good
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — Good rating', () => {
  const effortState = selectObjective(revealAnswer(INITIAL_STATE), 'right');

  it('selectRating Good sets memoryRating to Good', () => {
    const next = selectRating(effortState, 'Good');
    expect(next.memoryRating).toBe('Good');
  });

  it('selectRating Good transitions to result phase', () => {
    const next = selectRating(effortState, 'Good');
    expect(next.phase).toBe('result');
  });

  it('selectRating Good emits log with rating Good', () => {
    const next = selectRating(effortState, 'Good');
    expect(next.log.rating).toBe('Good');
  });
});

// ---------------------------------------------------------------------------
// 7. State machine — Easy selection records Easy
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — Easy rating', () => {
  const effortState = selectObjective(revealAnswer(INITIAL_STATE), 'right');

  it('selectRating Easy sets memoryRating to Easy', () => {
    const next = selectRating(effortState, 'Easy');
    expect(next.memoryRating).toBe('Easy');
  });

  it('selectRating Easy transitions to result phase', () => {
    const next = selectRating(effortState, 'Easy');
    expect(next.phase).toBe('result');
  });

  it('selectRating Easy emits log with rating Easy', () => {
    const next = selectRating(effortState, 'Easy');
    expect(next.log.rating).toBe('Easy');
  });
});

// ---------------------------------------------------------------------------
// 8. State machine — fixture summary says no data saved or scheduled
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold source — result state says no data saved', () => {
  const scaffoldPath = resolve(PROJECT_ROOT, 'src/components/study/FsrsTwoStepScaffold.jsx');
  const source = fs.readFileSync(scaffoldPath, 'utf8');

  it('source contains "no data" / "not save" copy', () => {
    expect(source).toContain('This fixture does not save, schedule, migrate, or modify review records.');
  });

  it('source contains "No data was saved" in result phase', () => {
    expect(source).toContain('No data was saved.');
  });

  it('source contains "No scheduling occurred" in result phase', () => {
    expect(source).toContain('No scheduling occurred.');
  });
});

// ---------------------------------------------------------------------------
// 9. State machine — reset/try again returns to initial state
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold state machine — reset', () => {
  it('reset returns phase question', () => {
    const result = selectObjective(revealAnswer(INITIAL_STATE), 'wrong');
    const fresh = reset();
    expect(fresh.phase).toBe('question');
  });

  it('reset clears objective', () => {
    expect(reset().objective).toBeNull();
  });

  it('reset clears memoryRating', () => {
    expect(reset().memoryRating).toBeNull();
  });

  it('reset clears log', () => {
    expect(reset().log).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 10. Static checks — fixture component source contains safety banner
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold source — safety banner present', () => {
  const scaffoldPath = resolve(PROJECT_ROOT, 'src/components/study/FsrsTwoStepScaffold.jsx');
  const source = fs.readFileSync(scaffoldPath, 'utf8');

  it('contains required safety banner text', () => {
    expect(source).toContain('FSRS UI FIXTURE: TEST MODE ONLY — NO DATA IS SAVED OR SCHEDULED.');
  });

  it('contains Again copy: Failed to recall / Complete blackout', () => {
    expect(source).toContain('Again: Failed to recall / Complete blackout.');
  });

  it('contains Hard copy: Recalled with severe mental effort or hesitation', () => {
    expect(source).toContain('Hard: Recalled with severe mental effort or hesitation.');
  });

  it('contains Good copy: Recalled smoothly with normal effort', () => {
    expect(source).toContain('Good: Recalled smoothly with normal effort.');
  });

  it('contains Easy copy: Instant recall; too simple', () => {
    expect(source).toContain('Easy: Instant recall; too simple.');
  });

  it('contains Objective correctness feeds copy', () => {
    expect(source).toContain('Objective correctness feeds scoring/mastery in the future.');
  });

  it('contains Subjective memory rating feeds copy', () => {
    expect(source).toContain('Subjective memory rating feeds FSRS scheduling in the future.');
  });
});

// ---------------------------------------------------------------------------
// 11. Static checks — no schedulerKind assignment in fixture source
// ---------------------------------------------------------------------------

describe('FsrsTwoStepScaffold source — no schedulerKind', () => {
  const scaffoldPath = resolve(PROJECT_ROOT, 'src/components/study/FsrsTwoStepScaffold.jsx');
  const source = fs.readFileSync(scaffoldPath, 'utf8');

  it('does not assign schedulerKind', () => {
    expect(source).not.toMatch(/schedulerKind/);
  });

  it('does not import reviewSchedulerAdapter', () => {
    expect(source).not.toMatch(/reviewSchedulerAdapter/i);
  });

  it('does not import fsrsWrapper', () => {
    expect(source).not.toMatch(/fsrsWrapper/i);
  });

  it('does not import settingsStorage', () => {
    expect(source).not.toMatch(/settingsStorage/i);
  });

  it('does not import reviewScheduleStorage', () => {
    expect(source).not.toMatch(/reviewScheduleStorage/i);
  });

  it('does not import StudyRoom', () => {
    expect(source).not.toMatch(/StudyRoom/i);
  });
});

// ---------------------------------------------------------------------------
// 12. Static checks — StudyRoom does not contain FSRS rating button strings
// ---------------------------------------------------------------------------

describe('StudyRoom — no FSRS rating buttons added', () => {
  const studyRoomPath = resolve(PROJECT_ROOT, 'src/routes/StudyRoom.jsx');
  const source = fs.readFileSync(studyRoomPath, 'utf8');

  it('does not contain Again/Hard/Good/Easy four-rating pattern', () => {
    expect(source).not.toMatch(/Again\s*\/\s*Hard\s*\/\s*Good\s*\/\s*Easy/i);
  });

  it('does not reference FsrsTwoStepScaffold', () => {
    expect(source).not.toContain('FsrsTwoStepScaffold');
  });

  it('does not reference /dev/fsrs-ui-fixture', () => {
    expect(source).not.toContain('/dev/fsrs-ui-fixture');
  });
});

// ---------------------------------------------------------------------------
// 13. Static checks — reviewSchedulerAdapter unchanged / no production fixture route
// ---------------------------------------------------------------------------

describe('reviewSchedulerAdapter — not modified for fixture', () => {
  const adapterPath = resolve(PROJECT_ROOT, 'src/quiz/reviewSchedulerAdapter.js');
  const source = fs.readFileSync(adapterPath, 'utf8');

  it('does not reference /dev/fsrs-ui-fixture', () => {
    expect(source).not.toContain('/dev/fsrs-ui-fixture');
  });

  it('does not reference FsrsTwoStepScaffold', () => {
    expect(source).not.toContain('FsrsTwoStepScaffold');
  });
});

// ---------------------------------------------------------------------------
// 14. Static checks — routeConfig registers fixture route hidden from nav
// ---------------------------------------------------------------------------

describe('routeConfig — fixture route registered as hidden', () => {
  const routeConfigPath = resolve(PROJECT_ROOT, 'src/routes/routeConfig.js');
  const source = fs.readFileSync(routeConfigPath, 'utf8');

  it('registers /dev/fsrs-ui-fixture path', () => {
    expect(source).toContain('/dev/fsrs-ui-fixture');
  });

  it('imports FsrsUiFixture', () => {
    expect(source).toContain('FsrsUiFixture');
  });

  it('does not assign schedulerKind', () => {
    expect(source).not.toMatch(/schedulerKind/);
  });
});
