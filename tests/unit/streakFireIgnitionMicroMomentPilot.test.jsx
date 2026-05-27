/**
 * Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot
 *
 * Static source analysis only. No jsdom rendering.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Expected file not found: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

const css = read('src/styles/global.css');
const summary = read('src/components/study/StudyResultSummary.jsx');
const studyRoom = read('src/routes/StudyRoom.jsx');
const workflow = read('.github/workflows/e2e-smoke.yml');
const validator = read('scripts/validate-phase37-uil-streak-fire-ignition-micro-moment-pilot.js');

describe('Phase 37-uiL — streak fire ignition micro-moment pilot', () => {
  it('attaches a passive marker only to the existing StudyResultSummary session completion panel', () => {
    expect(summary).toContain('phase37uil-streak-fire-ignition-micro-moment-pilot');
    expect(summary).toContain('data-phase37uil-streak-fire-ignition="session-complete-summary"');
    expect(summary).toContain('<Card');
    expect(summary).toContain('studyResultHero');
  });

  it('keeps StudyRoom completion, handler, navigation, and persistence logic unchanged by the pilot marker', () => {
    expect(studyRoom).toContain('function finishSession({ allowIncomplete = false } = {})');
    expect(studyRoom).toContain('const summary = createStudyAttemptSummary(items, getCurrentAttemptState());');
    expect(studyRoom).toContain('const historyResult = saveStudyHistoryRecord(historyRecord);');
    expect(studyRoom).toContain('setCompletedAttempt({');
    expect(studyRoom).not.toContain('phase37uil-streak-fire-ignition-micro-moment-pilot');
  });

  it('provides a calm ember glow, ignition ring, and reduced-motion static fallback in CSS', () => {
    expect(css).toContain('Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot');
    expect(css).toContain('.phase37uil-streak-fire-ignition-micro-moment-pilot::before');
    expect(css).toContain('.phase37uil-streak-fire-ignition-micro-moment-pilot::after');
    expect(css).toContain('phase37uil-streak-fire-success-aura');
    expect(css).toContain('phase37uil-streak-fire-ignition-ring');
    expect(css).toContain('pointer-events: none');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none;/);
  });

  it('does not introduce pressure-loop features, storage writes, sound, or confetti', () => {
    const changedRuntime = `${summary}\n${css}`;
    expect(changedRuntime).not.toMatch(/localStorage\s*\.\s*setItem|sessionStorage\s*\.\s*setItem/);
    expect(changedRuntime).not.toMatch(/\bstreak\s*counter\b|daily goal engine|persistent chain status/i);
    expect(changedRuntime).not.toMatch(/confetti|audio|sound|new Audio|AudioContext/i);
  });

  it('registers the Phase 37-uiL validator as the active workflow gate', () => {
    expect(workflow).toContain('Phase 37-uiK validator retained as historical reference; not run as Phase 37-uiL merge-blocking gate.');
    expect(workflow).toContain('# node scripts/validate-phase37-uik-elastic-tap-evidence-streak-fire-scope.js');
    expect(workflow).toContain('Validate Phase 37-uiL Streak Fire Ignition Micro-Moment Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uil-streak-fire-ignition-micro-moment-pilot.js');
    expect(workflow).not.toContain('continue-on-error: true');
  });

  it('keeps the validator post-merge-main safe from initial implementation', () => {
    expect(validator).toContain('pr-diff');
    expect(validator).toContain('post-merge-main');
    expect(validator).toContain('validator-hotfix');
    expect(validator).toContain("git(['rev-parse', '--verify', 'origin/main'])");
    expect(validator).not.toContain("git(['fetch'");
  });
});
