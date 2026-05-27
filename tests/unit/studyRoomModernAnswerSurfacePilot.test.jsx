import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

describe('Phase 37-uiF Study Room modern answer surface pilot', () => {
  const studyRoom = read('src/routes/StudyRoom.jsx');
  const css = read('src/styles/global.css');
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('adds one passive Study Room host marker derived from existing answer feedback state', () => {
    expect(studyRoom).toContain('phase37uif-study-room-modern-answer-surface-pilot');
    expect(studyRoom).toContain('data-phase37uif-answer-surface-state={answerFeedbackPolishState}');
    expect(studyRoom).toContain('data-phase35n-answer-feedback-state={answerFeedbackPolishState}');
    expect(studyRoom).toContain('currentItemState.checked');
    expect(studyRoom).toContain('currentItemState.revealed');
    expect(studyRoom).toContain('onCheck: checkCurrentAnswer');
    expect(studyRoom).toContain('onToggleReveal: toggleCurrentFlashcard');
    expect((studyRoom.match(/phase37uif-study-room-modern-answer-surface-pilot/g) || [])).toHaveLength(1);
  });

  it('scopes premium answer-card styling to the Phase 37-uiF Study Room answer surface', () => {
    expect(css).toContain('Phase 37-uiF');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot');
    expect(css).toContain('--phase37uif-answer-surface');
    expect(css).toContain('--phase37uif-answer-border');
    expect(css).toContain('--phase37uif-answer-glow');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--selected');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--correct');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--wrong');
  });

  it('covers explanation feedback, flashcard reveal, focus-visible, and reduced-motion surfaces', () => {
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .studyInteraction > .studyFeedback[role=\'status\']');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .studyFeedback--success');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .studyFeedback--danger');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .flashcard--revealed');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption:focus-within');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('does not introduce persistence, routes, theme mutation, or prior validators as active gates', () => {
    const runtime = `${studyRoom}\n${css}`;
    expect(runtime).not.toMatch(/localStorage\s*\.\s*setItem|setAttribute\(['"]data-theme|ThemePicker|persisted theme|account-synced/i);
    expect(workflow).toContain('Validate Phase 37-uiF Study Room Modern Answer Surface Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uif-study-room-modern-answer-surface-pilot.js');
    expect(workflow).toContain('Phase 37-uiE validator retained as historical reference');
  });
});
