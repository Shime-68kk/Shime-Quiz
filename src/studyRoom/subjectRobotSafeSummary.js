export const SUBJECT_ROBOT_SAFE_SUMMARY_SCHEMA_VERSION = 'subject-robot-safe-summary-v1';

const PRESSURE_ORDER = ['none', 'low', 'medium', 'high', 'urgent'];

function countBucket(count) {
  const value = Math.max(0, Number(count) || 0);
  if (value === 0) return '0';
  if (value <= 2) return '1_2';
  if (value <= 5) return '3_5';
  return '6_plus';
}

function highestPressure(spaces) {
  return (Array.isArray(spaces) ? spaces : []).reduce((highest, space) => {
    const current = String(space?.forgettingPressureBucket || 'none');
    return PRESSURE_ORDER.indexOf(current) > PRESSURE_ORDER.indexOf(highest) ? current : highest;
  }, 'none');
}

function companionAction(pressure) {
  if (pressure === 'urgent') return 'rescue_review_support';
  if (pressure === 'high') return 'focus_support';
  if (pressure === 'medium' || pressure === 'low') return 'gentle_reminder';
  return 'sleep';
}

function companionTone(pressure) {
  if (pressure === 'urgent') return 'urgent_but_soft';
  if (pressure === 'high' || pressure === 'medium') return 'encouraging';
  return 'calm';
}

export function createSubjectRobotSafeSummary(input = {}) {
  const spaces = Array.isArray(input.subjectSpaces) ? input.subjectSpaces : [];
  const pressure = highestPressure(spaces);
  const activeIndex = Math.max(0, spaces.findIndex(space => String(space?.subjectId || '') === String(input.activeSubjectId || '')));
  const activeSubjectBucket = spaces.length === 0 ? 'none' : `slot_${Math.min(activeIndex + 1, 5)}`;

  return {
    schemaVersion: SUBJECT_ROBOT_SAFE_SUMMARY_SCHEMA_VERSION,
    subjectCountBucket: countBucket(spaces.length),
    highestPressureBucket: pressure,
    activeSubjectBucket,
    suggestedCompanionAction: companionAction(pressure),
    companionTone: companionTone(pressure),
    safeSummaryCode: `subject_state_${pressure}_${countBucket(spaces.length)}`,
    rawContentIncluded: false,
    privacyClass: 'subject_state_coarse_only'
  };
}

export function assertSubjectRobotSafeSummary(summary = {}) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new TypeError('invalid_summary');
  }
  if (summary.rawContentIncluded !== false) throw new TypeError('unsafe_summary');
  if (summary.privacyClass !== 'subject_state_coarse_only') throw new TypeError('invalid_privacy_class');
  return true;
}
