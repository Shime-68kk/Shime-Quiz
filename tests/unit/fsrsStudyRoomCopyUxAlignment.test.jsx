/**
 * tests/unit/fsrsStudyRoomCopyUxAlignment.test.jsx
 *
 * Phase 15F — Study Room Copy / UX Alignment for Active Scheduling.
 *
 * The bridge is a pure presentational component. These tests render it
 * as a React element tree by invoking the function directly and walking
 * the returned virtual DOM tree, then make static source assertions on
 * the runtime files that must remain unchanged in scope.
 */

import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import FsrsProductionMemoryRatingBridge from '../../src/components/study/FsrsProductionMemoryRatingBridge.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function readProjectFile(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

// ── Tree walker helpers ─────────────────────────────────────────────────────

function flattenChildren(children) {
  if (children == null || children === false) return [];
  if (Array.isArray(children)) return children.flatMap(flattenChildren);
  return [children];
}

function collectText(element) {
  if (element == null || element === false) return '';
  if (typeof element === 'string' || typeof element === 'number') return String(element);
  if (Array.isArray(element)) return element.map(collectText).join('');
  if (typeof element === 'object' && element.props) {
    if (typeof element.type === 'function') {
      try {
        return collectText(element.type(element.props));
      } catch {
        return collectText(element.props.children);
      }
    }
    return collectText(element.props.children);
  }
  return '';
}

function findAll(element, predicate, results = []) {
  if (element == null || element === false) return results;
  if (Array.isArray(element)) {
    element.forEach(child => findAll(child, predicate, results));
    return results;
  }
  if (typeof element !== 'object') return results;
  if (predicate(element)) results.push(element);
  if (element.props && element.props.children !== undefined) {
    flattenChildren(element.props.children).forEach(child => findAll(child, predicate, results));
  }
  return results;
}

function renderBridge(props) {
  return FsrsProductionMemoryRatingBridge({
    objectiveCorrect: true,
    bridgeState: undefined,
    onSelectRating: () => {},
    onSkip: () => {},
    ...props
  });
}

// ── 1. Default / inactive bridge copy preserves Phase 14N inert wording ──────

describe('Phase 15F — default/inactive bridge copy', () => {
  it('default rendering says study schedule is not changed by this rating yet', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false });
    const text = collectText(tree);
    expect(text).toContain('Your study schedule is not changed by this rating yet.');
  });

  it('auto-again copy in default mode says schedule is not changed', () => {
    const tree = renderBridge({
      objectiveCorrect: false,
      bridgeState: { phase: 'auto-again', rating: 'Again' },
      isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false
    });
    const text = collectText(tree);
    expect(text).toContain('Needs another review.');
    expect(text).toContain('Your study schedule is not changed by this rating yet.');
  });

  it('rated copy in default mode says schedule is not affected', () => {
    const tree = renderBridge({
      bridgeState: { phase: 'rated', rating: 'Hard' },
      isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false
    });
    const text = collectText(tree);
    expect(text).toContain('Recorded');
    expect(text).toContain('Your schedule is not affected.');
  });

  it('omitting the active prop defaults to inert default copy', () => {
    const tree = renderBridge({});
    const text = collectText(tree);
    expect(text).toContain('Your study schedule is not changed by this rating yet.');
    expect(text).not.toContain('may adjust when you next see this card');
  });
});

// ── 2. Active-capable bridge copy uses "may adjust" non-guarantee wording ────

describe('Phase 15F — active-capable bridge copy', () => {
  it('active mode header uses "may adjust when you next see this card"', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const text = collectText(tree);
    expect(text).toContain('This rating may adjust when you next see this card.');
  });

  it('active mode auto-again says recorded as Again with may-adjust wording', () => {
    const tree = renderBridge({
      objectiveCorrect: false,
      bridgeState: { phase: 'auto-again', rating: 'Again' },
      isActiveSchedulingCopyEnabled: true
    });
    const text = collectText(tree);
    expect(text).toContain('recorded as Again');
    expect(text).toContain('may adjust when you next see this card');
  });

  it('active mode rated copy uses may-adjust wording', () => {
    const tree = renderBridge({
      bridgeState: { phase: 'rated', rating: 'Good' },
      isActiveSchedulingCopyEnabled: true
    });
    const text = collectText(tree);
    expect(text).toContain('Recorded');
    expect(text).toContain('may adjust when you next see this card');
  });

  it('active mode rated copy still shows the chosen rating label', () => {
    const tree = renderBridge({
      bridgeState: { phase: 'rated', rating: 'Easy' },
      isActiveSchedulingCopyEnabled: true
    });
    const text = collectText(tree);
    expect(text).toContain('Easy');
  });
});

// ── 3. Active copy must not overclaim or expose internal flag ───────────────

describe('Phase 15F — active copy claim-safety guards', () => {
  const FORBIDDEN_PHRASES = [
    'FSRS is active for everyone',
    'AI scheduling is enabled',
    'guaranteed',
    'fsrsActiveSchedulingEnabled'
  ];

  it('active mode does not say FSRS is active for everyone', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const text = collectText(tree);
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it('active mode auto-again does not expose forbidden claims', () => {
    const tree = renderBridge({
      objectiveCorrect: false,
      bridgeState: { phase: 'auto-again', rating: 'Again' },
      isActiveSchedulingCopyEnabled: true
    });
    const text = collectText(tree);
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it('default mode does not say active scheduling is enabled', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false });
    const text = collectText(tree);
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(text).not.toContain(phrase);
    }
    expect(text).not.toContain('may adjust when you next see this card');
  });

  it('bridge source does not include forbidden user-facing substrings as JSX text', () => {
    const bridgeSource = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(bridgeSource).not.toMatch(/>\s*FSRS is active for everyone\s*</);
    expect(bridgeSource).not.toMatch(/>\s*AI scheduling is enabled\s*</);
    expect(bridgeSource).not.toMatch(/>\s*fsrsActiveSchedulingEnabled\s*</);
    expect(bridgeSource).not.toContain("'guaranteed'");
    expect(bridgeSource).not.toContain('"guaranteed"');
  });
});

// ── 4. Continue without rating semantics ────────────────────────────────────

describe('Phase 15F — Continue without rating copy', () => {
  it('Continue without rating button label remains visible in default mode', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false });
    const buttons = findAll(tree, el => el?.type === 'button');
    // Phase 16A: button now renders Vietnamese-first label alongside the English
    // helper text, so we match on substring inclusion instead of strict equality.
    const skipButton = buttons.find(b => collectText(b).includes('Continue without rating'));
    expect(skipButton).toBeDefined();
  });

  it('Continue without rating button label remains visible in active mode', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const buttons = findAll(tree, el => el?.type === 'button');
    const skipButton = buttons.find(b => collectText(b).includes('Continue without rating'));
    expect(skipButton).toBeDefined();
  });

  it('active mode skip help text says normal review update continues', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const text = collectText(tree);
    expect(text).toContain('Continue without rating keeps the normal review update for this answer.');
  });

  it('skipped phase renders nothing (no copy leaks)', () => {
    const tree = renderBridge({
      bridgeState: { phase: 'skipped', rating: null },
      isActiveSchedulingCopyEnabled: true
    });
    expect(tree).toBeNull();
  });

  it('StudyRoom does not invent a synthetic Good rating for skip', () => {
    const studyRoomSource = readProjectFile('src/routes/StudyRoom.jsx');
    const skipHandler = studyRoomSource.match(/function handleBridgeSkip[\s\S]*?\n\s*\}/);
    expect(skipHandler).not.toBeNull();
    expect(skipHandler[0]).not.toContain("rating: 'Good'");
    expect(skipHandler[0]).not.toContain("rating: 'Hard'");
    expect(skipHandler[0]).not.toContain("rating: 'Easy'");
    expect(skipHandler[0]).not.toContain('appendFsrsReviewLog');
  });
});

// ── 5. Wrong/unanswered maps to Again, copy is claim-safe ───────────────────

describe('Phase 15F — Wrong/unanswered Again copy', () => {
  it('default-mode wrong path uses "Needs another review" copy', () => {
    const tree = renderBridge({
      objectiveCorrect: false,
      bridgeState: { phase: 'auto-again', rating: 'Again' },
      isActiveSchedulingCopyEnabled: false, isActiveSchedulingCopyContextEligible: false
    });
    const text = collectText(tree);
    expect(text).toContain('Needs another review.');
    expect(text).not.toContain('guaranteed');
  });

  it('active-mode wrong path uses claim-safe Again wording', () => {
    const tree = renderBridge({
      objectiveCorrect: false,
      bridgeState: { phase: 'auto-again', rating: 'Again' },
      isActiveSchedulingCopyEnabled: true
    });
    const text = collectText(tree);
    expect(text).toContain('recorded as Again');
    expect(text).not.toContain('guaranteed');
  });
});

// ── 6. Hard / Good / Easy effort-based labels remain neutral ────────────────

describe('Phase 15F — Hard/Good/Easy effort labels', () => {
  it('rating buttons still expose Hard, Good, and Easy labels', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const text = collectText(tree);
    expect(text).toContain('Hard');
    expect(text).toContain('Good');
    expect(text).toContain('Easy');
  });

  it('rating descriptions remain effort-based, not schedule-guarantee', () => {
    const tree = renderBridge({ isActiveSchedulingCopyEnabled: true });
    const text = collectText(tree);
    expect(text).toContain('Recalled with serious effort.');
    expect(text).toContain('Recalled with normal effort.');
    expect(text).toContain('Instant recall.');
    expect(text).not.toMatch(/guarantee/i);
  });

  it('bridge source does not promise schedule changes for any rating', () => {
    const bridgeSource = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(bridgeSource).not.toMatch(/guarantee/i);
    expect(bridgeSource).not.toContain('This guarantees a longer interval');
    expect(bridgeSource).not.toContain('This will always change your schedule');
  });
});

// ── 7. StudyRoom passes the copy mode only when appropriate ─────────────────

describe('Phase 15F — StudyRoom wires the active copy prop appropriately', () => {
  it('StudyRoom imports the bridge component', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('FsrsProductionMemoryRatingBridge');
  });

  it('StudyRoom passes isActiveSchedulingCopyContextEligible to the bridge', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('isActiveSchedulingCopyContextEligible={isActiveSchedulingCopyContextEligible}');
  });

  it('StudyRoom derives the context-eligible flag from the bridge gate, not from settings storage', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('getBridgeToggleEnabled');
    expect(source).toContain('showBridge');
    expect(source).not.toContain('settingsStorage');
  });

  it('StudyRoom only renders the bridge when showBridge is true (gate preserved)', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).toContain('shouldShowFsrsTwoStepBridge');
    expect(source).toContain('showBridge');
  });

  it('StudyRoom does not render the internal flag identifier as user-facing JSX text', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toMatch(/>\s*fsrsActiveSchedulingEnabled\s*</);
  });

  it('StudyRoom does not contain a public rollout claim', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toContain('FSRS is active for everyone');
    expect(source).not.toContain('AI scheduling is enabled');
    expect(source).not.toMatch(/active scheduling is broadly available/i);
  });
});

// ── 8. Scheduler/storage/Dashboard/Settings/backup files unchanged ──────────

describe('Phase 15F — out-of-scope files remain unchanged', () => {
  it('reviewSchedulerAdapter.js is not referenced as a new import surface in bridge', () => {
    const bridgeSource = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(bridgeSource).not.toContain('reviewSchedulerAdapter');
    expect(bridgeSource).not.toContain('fsrsWrapper');
  });

  it('reviewScheduleStorage.js is not referenced from the bridge', () => {
    const bridgeSource = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(bridgeSource).not.toContain('reviewScheduleStorage');
  });

  it('Dashboard.jsx does not contain Phase 15F references', () => {
    const source = readProjectFile('src/routes/Dashboard.jsx');
    expect(source).not.toContain('isActiveSchedulingCopyEnabled');
    expect(source).not.toContain('phase15f');
    expect(source).not.toContain('FsrsProductionMemoryRatingBridge');
  });

  it('Settings.jsx does not expose fsrsActiveSchedulingEnabled as a public toggle', () => {
    const source = readProjectFile('src/routes/Settings.jsx');
    expect(source).not.toContain('fsrsActiveSchedulingEnabled');
  });

  it('v2BackupRestore.js was not modified for Phase 15F', () => {
    const source = readProjectFile('src/state/v2BackupRestore.js');
    expect(source).not.toContain('phase15f');
    expect(source).not.toContain('isActiveSchedulingCopyEnabled');
  });

  it('settingsStorage.js was not modified to expose copy-mode helpers', () => {
    const source = readProjectFile('src/state/settingsStorage.js');
    expect(source).not.toContain('isActiveSchedulingCopyEnabled');
    expect(source).not.toContain('phase15f');
  });

  it('fsrsWrapper.js was not modified for Phase 15F', () => {
    const source = readProjectFile('src/quiz/fsrsWrapper.js');
    expect(source).not.toContain('isActiveSchedulingCopyEnabled');
    expect(source).not.toContain('phase15f');
  });
});

// ── 9. No new ts-fsrs.next() call sites ─────────────────────────────────────

describe('Phase 15F — no new ts-fsrs.next() call sites', () => {
  it('bridge component has no .next() call', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source).not.toMatch(/\.next\s*\(/);
  });

  it('StudyRoom.jsx has no .next() call', () => {
    const source = readProjectFile('src/routes/StudyRoom.jsx');
    expect(source).not.toMatch(/\.next\s*\(/);
  });

  it('fsrsWrapper.js has exactly 2 .next() call sites (Phase 15B baseline preserved)', () => {
    const source = readProjectFile('src/quiz/fsrsWrapper.js');
    const matches = source.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

// ── 10. No package/dependency changes ───────────────────────────────────────

describe('Phase 15F — no package or dependency changes', () => {
  it('package.json still pins ts-fsrs to 5.3.3', () => {
    const pkg = JSON.parse(readProjectFile('package.json'));
    expect(pkg.dependencies['ts-fsrs']).toBe('5.3.3');
  });

  it('package.json contains no native binding dependency for ts-fsrs', () => {
    const source = readProjectFile('package.json');
    expect(source).not.toContain('@open-spaced-repetition/binding');
  });
});

// ── 11. Bridge component preserves Phase 14N invariants ─────────────────────

describe('Phase 15F — Phase 14N regression checks', () => {
  it('bridge still uses role="region" for accessibility', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source.includes('role="region"') || source.includes("role='region'")).toBe(true);
  });

  it('bridge still renders Continue without rating button', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source).toContain('Continue without rating');
  });

  it('bridge source still includes scheduling-not-affected copy for default mode', () => {
    const source = readProjectFile('src/components/study/FsrsProductionMemoryRatingBridge.jsx');
    expect(source.toLowerCase()).toContain('schedule');
    expect(source.toLowerCase()).toContain('not changed');
    expect(source).toContain('Your schedule is not affected');
  });
});

// ── 12. Phase 15F docs and validator presence ───────────────────────────────

describe('Phase 15F — docs and validator presence', () => {
  it('docs/phase15f-studyroom-copy-ux-alignment.md exists and references key points', () => {
    const source = readProjectFile('docs/phase15f-studyroom-copy-ux-alignment.md');
    expect(source).toContain('Phase 15F');
    expect(source).toContain('Active FSRS');
    expect(source).toContain('default OFF');
    expect(source).toContain('may adjust');
    expect(source).toContain('isActiveSchedulingCopyEnabled');
  });

  it('Phase 15F validator script exists', () => {
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'scripts/validate-phase15f-studyroom-copy-ux-alignment.js'))).toBe(true);
  });

  it('Phase 15F validator is registered after Phase 15E in the workflow', () => {
    const source = readProjectFile('.github/workflows/e2e-smoke.yml');
    const phase15ePos = source.indexOf('validate-phase15e-controlled-internal-activation-harness.js');
    const phase15fPos = source.indexOf('validate-phase15f-studyroom-copy-ux-alignment.js');
    expect(phase15ePos).toBeGreaterThan(-1);
    expect(phase15fPos).toBeGreaterThan(phase15ePos);
  });
});
