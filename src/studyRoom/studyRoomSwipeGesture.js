import { resolveMobileGestureIntent } from './mobileGestureIntentModel.js';

export const STUDY_ROOM_SWIPE_DEFAULTS = Object.freeze({
  minHorizontalDistance: 86,
  maxVerticalDrift: 72,
  horizontalDominanceRatio: 1.45,
  elapsedMs: 180,
  viewportWidth: 390
});

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function resolveStudyRoomSwipeGesture(input = {}, options = {}) {
  const minHorizontalDistance = finiteNumber(
    options.minHorizontalDistance,
    STUDY_ROOM_SWIPE_DEFAULTS.minHorizontalDistance
  );
  const maxVerticalDrift = finiteNumber(options.maxVerticalDrift, STUDY_ROOM_SWIPE_DEFAULTS.maxVerticalDrift);
  const horizontalDominanceRatio = finiteNumber(
    options.horizontalDominanceRatio,
    STUDY_ROOM_SWIPE_DEFAULTS.horizontalDominanceRatio
  );
  const elapsedMs = finiteNumber(input.elapsedMs, options.elapsedMs ?? STUDY_ROOM_SWIPE_DEFAULTS.elapsedMs);
  const viewportWidth = finiteNumber(input.viewportWidth, options.viewportWidth ?? STUDY_ROOM_SWIPE_DEFAULTS.viewportWidth);
  const reducedMotion = input.reducedMotion === true || options.reducedMotion === true;

  const startX = finiteNumber(input.startX, null);
  const startY = finiteNumber(input.startY, null);
  const endX = finiteNumber(input.endX, null);
  const endY = finiteNumber(input.endY, null);
  if ([startX, startY, endX, endY].some(value => value === null)) return 'none';

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const intent = resolveMobileGestureIntent({
    deltaX,
    deltaY,
    elapsedMs,
    pointerType: input.pointerType || 'touch',
    viewportWidth,
    reducedMotion,
    currentInteraction: input.currentInteraction || 'question_navigation'
  });
  if (!intent.shouldNavigateHorizontally) return 'none';

  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  if (horizontalDistance < minHorizontalDistance) return 'none';
  if (verticalDistance > maxVerticalDrift) return 'none';
  if (horizontalDistance < verticalDistance * horizontalDominanceRatio) return 'none';

  return deltaX < 0 ? 'next' : 'previous';
}
