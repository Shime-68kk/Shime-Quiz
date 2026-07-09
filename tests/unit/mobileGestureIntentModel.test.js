import { describe, expect, it } from 'vitest';
import { resolveMobileGestureIntent } from '../../src/studyRoom/mobileGestureIntentModel.js';

describe('mobileGestureIntentModel', () => {
  it('allows a clear fast horizontal swipe', () => {
    expect(resolveMobileGestureIntent({
      deltaX: -96,
      deltaY: 10,
      elapsedMs: 160,
      pointerType: 'touch',
      viewportWidth: 390
    })).toMatchObject({
      intent: 'horizontal_swipe',
      shouldNavigateHorizontally: true,
      shouldPreserveVerticalScroll: false,
      transitionPreset: 'subtle_slide'
    });
  });

  it('allows slight diagonal horizontal swipe only when X strongly dominates', () => {
    expect(resolveMobileGestureIntent({
      deltaX: 90,
      deltaY: 28,
      elapsedMs: 180,
      pointerType: 'touch',
      viewportWidth: 390
    }).shouldNavigateHorizontally).toBe(true);
  });

  it('preserves vertical scroll for diagonal gestures', () => {
    const result = resolveMobileGestureIntent({
      deltaX: 70,
      deltaY: 62,
      elapsedMs: 180,
      pointerType: 'touch',
      viewportWidth: 390
    });
    expect(result).toMatchObject({
      intent: 'vertical_scroll',
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true
    });
    expect(result.reasonCodes).toContain('DIAGONAL_GUARD_VERTICAL_PRIORITY');
  });

  it('never blocks clear vertical scroll', () => {
    expect(resolveMobileGestureIntent({
      deltaX: 20,
      deltaY: 120,
      elapsedMs: 140,
      pointerType: 'touch',
      viewportWidth: 390
    })).toMatchObject({
      intent: 'vertical_scroll',
      shouldPreserveVerticalScroll: true
    });
  });

  it('treats small tap motion as non-navigation', () => {
    expect(resolveMobileGestureIntent({
      deltaX: 8,
      deltaY: 7,
      elapsedMs: 90,
      pointerType: 'touch',
      viewportWidth: 390
    })).toMatchObject({
      intent: 'tap_or_small_motion',
      shouldNavigateHorizontally: false
    });
  });

  it('ignores slow ambiguous drag and preserves scroll', () => {
    expect(resolveMobileGestureIntent({
      deltaX: 58,
      deltaY: 22,
      elapsedMs: 620,
      pointerType: 'touch',
      viewportWidth: 390
    })).toMatchObject({
      intent: 'ignore',
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true
    });
  });

  it('uses reduced motion transition preset', () => {
    expect(resolveMobileGestureIntent({
      deltaX: -96,
      deltaY: 10,
      elapsedMs: 160,
      pointerType: 'touch',
      viewportWidth: 390,
      reducedMotion: true
    }).transitionPreset).toBe('reduced_motion_fade');
  });
});
