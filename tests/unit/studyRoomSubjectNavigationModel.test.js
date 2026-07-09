import { describe, expect, it } from 'vitest';
import { resolveStudyRoomSubjectNavigation } from '../../src/studyRoom/studyRoomSubjectNavigationModel.js';

const subjectSpaces = [
  { subjectId: 'math', subjectLabel: 'Toán' },
  { subjectId: 'physics', subjectLabel: 'Vật lý' },
  { subjectId: 'english', subjectLabel: 'English' }
];

describe('studyRoomSubjectNavigationModel', () => {
  it('works with zero subjects', () => {
    expect(resolveStudyRoomSubjectNavigation({ subjectSpaces: [] })).toMatchObject({
      activeSubjectId: '',
      activeIndex: -1,
      canGoPrev: false,
      canGoNext: false
    });
  });

  it('keeps a single subject stable', () => {
    expect(resolveStudyRoomSubjectNavigation({ subjectSpaces: [subjectSpaces[0]], gesture: 'swipe_left' })).toMatchObject({
      activeSubjectId: 'math',
      canGoPrev: false,
      canGoNext: false,
      transitionDirection: 'none'
    });
  });

  it('moves by swipe and keyboard gestures', () => {
    expect(resolveStudyRoomSubjectNavigation({ subjectSpaces, activeSubjectId: 'math', gesture: 'swipe_left' })).toMatchObject({
      activeSubjectId: 'physics',
      transitionDirection: 'left'
    });
    expect(resolveStudyRoomSubjectNavigation({ subjectSpaces, activeSubjectId: 'physics', gesture: 'keyboard_prev' })).toMatchObject({
      activeSubjectId: 'math',
      transitionDirection: 'right'
    });
  });

  it('supports tap target and reduced motion', () => {
    expect(resolveStudyRoomSubjectNavigation({
      subjectSpaces,
      activeSubjectId: 'math',
      gesture: 'tap_subject',
      targetSubjectId: 'english',
      prefersReducedMotion: true
    })).toMatchObject({
      activeSubjectId: 'english',
      motionSafety: 'reduced_motion_safe'
    });
  });

  it('falls back when active id is missing', () => {
    expect(resolveStudyRoomSubjectNavigation({ subjectSpaces, activeSubjectId: 'missing' }).activeSubjectId).toBe('math');
  });
});
