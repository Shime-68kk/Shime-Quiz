import { describe, expect, it } from 'vitest';
import {
  isReducedMotion,
  animateQuestionIn,
  animateAnswerFeedback,
  animateProgressBar,
  animateOptionClick
} from '../../src/uiMotion/gsapQuizAnimations.js';

function createMockElement() {
  return {
    style: {},
    querySelectorAll: () => []
  };
}

describe('gsapQuizAnimations module', () => {
  it('exports all expected animation functions', () => {
    expect(typeof isReducedMotion).toBe('function');
    expect(typeof animateQuestionIn).toBe('function');
    expect(typeof animateAnswerFeedback).toBe('function');
    expect(typeof animateProgressBar).toBe('function');
    expect(typeof animateOptionClick).toBe('function');
  });

  it('safely handles null elements without crashing', () => {
    expect(animateQuestionIn(null)).toBeNull();
    expect(animateOptionClick(null)).toBeNull();
    
    let finished = false;
    animateProgressBar({
      fillEl: null,
      counterEl: null,
      fromPercent: 0,
      toPercent: 50,
      onComplete: () => { finished = true; }
    });
  });

  it('returns valid gsap tweens and timelines for element targets', () => {
    const mockDiv = createMockElement();
    const mockFill = createMockElement();
    const mockCounter = { textContent: '' };

    const tlIn = animateQuestionIn(mockDiv, { direction: 'next' });
    expect(tlIn).not.toBeNull();
    expect(typeof tlIn.kill).toBe('function');
    tlIn.kill();

    const tlCorrect = animateAnswerFeedback({
      selectedOptionEl: mockDiv,
      isCorrect: true
    });
    expect(tlCorrect).not.toBeNull();
    tlCorrect.kill();

    const tlWrong = animateAnswerFeedback({
      selectedOptionEl: mockDiv,
      isCorrect: false
    });
    expect(tlWrong).not.toBeNull();
    tlWrong.kill();

    const progressTween = animateProgressBar({
      fillEl: mockFill,
      counterEl: mockCounter,
      fromPercent: 10,
      toPercent: 40,
      duration: 0.1
    });
    expect(progressTween).not.toBeNull();
    progressTween.kill();
  });
});
