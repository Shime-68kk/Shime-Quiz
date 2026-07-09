import { describe, expect, it } from 'vitest';
import { resolveStudyRoomSwipeGesture } from '../../src/studyRoom/studyRoomSwipeGesture.js';

describe('studyRoomSwipeGesture', () => {
  it('requires a clear horizontal swipe before going next', () => {
    expect(resolveStudyRoomSwipeGesture({
      startX: 220,
      startY: 120,
      endX: 120,
      endY: 132
    })).toBe('next');
  });

  it('requires a clear horizontal swipe before going previous', () => {
    expect(resolveStudyRoomSwipeGesture({
      startX: 120,
      startY: 120,
      endX: 220,
      endY: 132
    })).toBe('previous');
  });

  it('ignores short horizontal movement to reduce sensitivity', () => {
    expect(resolveStudyRoomSwipeGesture({
      startX: 200,
      startY: 100,
      endX: 130,
      endY: 105
    })).toBe('none');
  });

  it('lets diagonal or vertical swipes behave like normal page scroll', () => {
    expect(resolveStudyRoomSwipeGesture({
      startX: 220,
      startY: 100,
      endX: 130,
      endY: 190
    })).toBe('none');
    expect(resolveStudyRoomSwipeGesture({
      startX: 220,
      startY: 100,
      endX: 170,
      endY: 220
    })).toBe('none');
  });

  it('ignores slow ambiguous drag even when horizontal movement exists', () => {
    expect(resolveStudyRoomSwipeGesture({
      startX: 220,
      startY: 100,
      endX: 132,
      endY: 130,
      elapsedMs: 640
    })).toBe('none');
  });
});
