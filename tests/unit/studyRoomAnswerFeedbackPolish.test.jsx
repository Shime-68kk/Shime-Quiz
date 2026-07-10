import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

describe('Phase 35N Study Room Answer Feedback Polish', () => {
  const studyRoom = read('src/routes/StudyRoom.jsx');
  const css = read('src/styles/global.css');
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('derives visual feedback state from existing Study Room answer state only', () => {
    expect(studyRoom).toContain('answerFeedbackPolishState');
    expect(studyRoom).toContain('currentItemState.checked');
    expect(studyRoom).toContain('objectiveCorrect === true');
    expect(studyRoom).toContain('objectiveCorrect === false');
    expect(studyRoom).toContain('currentItemState.revealed');
    expect(studyRoom).toContain('data-phase35n-answer-feedback-state');
  });

  it('keeps answer handlers and queue progression behavior untouched', () => {
    expect(studyRoom).toContain('function checkCurrentAnswer()');
    expect(studyRoom).toContain('setCheckedByItemId(current => ({ ...current, [currentItemId]: true }))');
    expect(studyRoom).toContain('showMicroFeedback(getCheckedAnswerFeedback(currentItem, nextItemState, t))');
    expect(studyRoom).toContain('function goToNext()');
    expect(studyRoom).toContain('setCurrentIndex(index => Math.min(items.length - 1, index + 1))');
    expect(studyRoom).not.toMatch(/setCurrentIndex\s*\([^)]*checkCurrentAnswer/);
  });

  it('adds calm correct, incorrect, neutral, and revealed visual states in CSS', () => {
    expect(css).toContain('.studyAnswerFeedbackPolish--correct');
    expect(css).toContain('.studyAnswerFeedbackPolish--incorrect');
    expect(css).toContain('.studyAnswerFeedbackPolish--checked');
    expect(css).toContain('.studyAnswerFeedbackPolish--revealed');
    expect(css).toContain('study-answer-feedback-polish-enter');
    expect(css).toContain('border-left-width: 4px');
  });

  it('preserves focus-visible and reduced-motion support', () => {
    expect(css).toContain('.shortAnswerField input:focus-visible');
    expect(css).toContain('.choiceOption:focus-within');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation: none');
  });

  it('registers only the Phase 35N validator as the active phase gate', () => {
    expect(workflow).toContain('Validate Phase 35N Study Room Answer Feedback Polish');
    expect(workflow).toContain('node scripts/validate-phase35n-study-room-answer-feedback-polish.js');
    expect(workflow).toContain('Phase 35M validator retained as historical reference');
    expect(workflow).not.toMatch(/run:\s*node scripts\/validate-phase35m-next-ui-polish-scope\.js/);
  });
});
