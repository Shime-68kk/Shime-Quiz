function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getSubjectId(space) {
  return String(space?.subjectId || '').trim();
}

export function resolveStudyRoomSubjectNavigation(input = {}) {
  const subjectSpaces = asArray(input.subjectSpaces).filter(space => getSubjectId(space));
  const count = subjectSpaces.length;
  const requestedId = String(input.activeSubjectId || '').trim();
  const currentIndex = Math.max(0, subjectSpaces.findIndex(space => getSubjectId(space) === requestedId));
  const activeIndex = count === 0 ? -1 : currentIndex === -1 ? 0 : currentIndex;
  const gesture = String(input.gesture || 'none');
  let nextIndex = activeIndex;

  if (count > 0) {
    if (gesture === 'swipe_left' || gesture === 'keyboard_next') nextIndex = Math.min(count - 1, activeIndex + 1);
    if (gesture === 'swipe_right' || gesture === 'keyboard_prev') nextIndex = Math.max(0, activeIndex - 1);
    if (gesture === 'tap_subject') {
      const targetIndex = subjectSpaces.findIndex(space => getSubjectId(space) === String(input.targetSubjectId || '').trim());
      if (targetIndex >= 0) nextIndex = targetIndex;
    }
  }

  const active = subjectSpaces[nextIndex] || null;
  const previous = nextIndex > 0 ? subjectSpaces[nextIndex - 1] : null;
  const next = nextIndex >= 0 && nextIndex < count - 1 ? subjectSpaces[nextIndex + 1] : null;

  return {
    activeSubjectId: getSubjectId(active),
    activeIndex: nextIndex,
    previousSubjectId: getSubjectId(previous),
    nextSubjectId: getSubjectId(next),
    canGoPrev: Boolean(previous),
    canGoNext: Boolean(next),
    transitionDirection: nextIndex > activeIndex ? 'left' : nextIndex < activeIndex ? 'right' : 'none',
    ariaLabel: active ? `Không gian học ${active.subjectLabel || active.subjectId}` : 'Không có không gian học',
    motionSafety: input.prefersReducedMotion === true ? 'reduced_motion_safe' : 'normal'
  };
}
