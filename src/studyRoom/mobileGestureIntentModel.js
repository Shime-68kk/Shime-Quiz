const PHONE_WIDTH_MAX = 640;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function resolveMobileGestureIntent(input = {}) {
  const deltaX = finiteNumber(input.deltaX);
  const deltaY = finiteNumber(input.deltaY);
  const elapsedMs = Math.max(0, finiteNumber(input.elapsedMs));
  const pointerType = ['touch', 'mouse', 'pen', 'unknown'].includes(input.pointerType)
    ? input.pointerType
    : 'unknown';
  const viewportWidth = Math.max(0, finiteNumber(input.viewportWidth));
  const reducedMotion = input.reducedMotion === true;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const isPhone = viewportWidth > 0 && viewportWidth <= PHONE_WIDTH_MAX;
  const minHorizontalDistance = isPhone ? 42 : 64;
  const smallMotionThreshold = 12;
  const horizontalDominanceRatio = 1.45;
  const diagonalGuardY = 18;
  const slowAmbiguousMs = 420;
  const reasonCodes = [];

  if (absX < smallMotionThreshold && absY < smallMotionThreshold) {
    return {
      intent: 'tap_or_small_motion',
      confidence: 95,
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true,
      transitionPreset: 'none',
      reasonCodes: ['SMALL_MOTION']
    };
  }

  const horizontalDominates = absX >= absY * horizontalDominanceRatio;
  const verticalCloseOrDominant = absY >= absX / horizontalDominanceRatio;

  if (absY > diagonalGuardY && !horizontalDominates) {
    reasonCodes.push('DIAGONAL_GUARD_VERTICAL_PRIORITY');
    if (elapsedMs >= slowAmbiguousMs) reasonCodes.push('SLOW_AMBIGUOUS_DRAG');
    return {
      intent: 'vertical_scroll',
      confidence: clamp(Math.round(60 + Math.min(absY, 80) / 2), 60, 96),
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true,
      transitionPreset: 'none',
      reasonCodes
    };
  }

  if (verticalCloseOrDominant && !horizontalDominates) {
    return {
      intent: 'vertical_scroll',
      confidence: 78,
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true,
      transitionPreset: 'none',
      reasonCodes: ['VERTICAL_CLOSE_OR_DOMINANT']
    };
  }

  if (elapsedMs >= slowAmbiguousMs && absX < minHorizontalDistance * 2.2) {
    return {
      intent: 'ignore',
      confidence: 68,
      shouldNavigateHorizontally: false,
      shouldPreserveVerticalScroll: true,
      transitionPreset: 'none',
      reasonCodes: ['SLOW_AMBIGUOUS_DRAG']
    };
  }

  if (absX >= minHorizontalDistance && horizontalDominates && pointerType !== 'mouse') {
    const confidence = clamp(Math.round(72 + Math.min(absX - minHorizontalDistance, 80) / 3), 72, 98);
    return {
      intent: 'horizontal_swipe',
      confidence,
      shouldNavigateHorizontally: true,
      shouldPreserveVerticalScroll: false,
      transitionPreset: reducedMotion ? 'reduced_motion_fade' : 'subtle_slide',
      reasonCodes: ['CLEAR_HORIZONTAL_INTENT', isPhone ? 'PHONE_THRESHOLD' : 'DESKTOP_THRESHOLD']
    };
  }

  return {
    intent: 'ignore',
    confidence: 55,
    shouldNavigateHorizontally: false,
    shouldPreserveVerticalScroll: true,
    transitionPreset: 'none',
    reasonCodes: ['NO_CLEAR_INTENT']
  };
}
