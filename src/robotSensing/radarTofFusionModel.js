const CONFIDENCE = Object.freeze({ none: 0, low: 35, medium: 65, high: 85 });
const RANGE = new Set(['none', 'very_near', 'near', 'study_range', 'far', 'out_of_range']);

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function safeInput(input = {}) {
  return {
    radarAvailable: input.radarAvailable === true,
    radarOccupied: input.radarOccupied === true,
    radarActive: input.radarActive === true,
    radarStationary: input.radarStationary === true,
    radarConfidenceBucket: Object.prototype.hasOwnProperty.call(CONFIDENCE, input.radarConfidenceBucket) ? input.radarConfidenceBucket : 'none',
    tofAvailable: input.tofAvailable === true,
    tofDistanceBucket: RANGE.has(input.tofDistanceBucket) ? input.tofDistanceBucket : 'none',
    tofTrend: ['unknown', 'approaching', 'leaving', 'stable'].includes(input.tofTrend) ? input.tofTrend : 'unknown',
    tofBlockedLikely: input.tofBlockedLikely === true,
    robotRecentlyMoved: input.robotRecentlyMoved === true,
    appFocusNeedBucket: ['none', 'low', 'medium', 'high'].includes(input.appFocusNeedBucket) ? input.appFocusNeedBucket : 'none',
    appStudyLoadBucket: ['none', 'low', 'medium', 'high'].includes(input.appStudyLoadBucket) ? input.appStudyLoadBucket : 'none'
  };
}

function result(fusionState, confidence, evidenceCodes, recommendedRobotBehavior) {
  return {
    fusionState,
    confidence: clamp(confidence),
    evidenceCodes,
    recommendedRobotBehavior,
    safetyClass: 'safe_coarse_sensing_only',
    rawDataUsed: false
  };
}

export function fuseRadarTofPresence(input = {}) {
  const s = safeInput(input);
  const radarScore = CONFIDENCE[s.radarConfidenceBucket];
  const tofNear = ['very_near', 'near', 'study_range'].includes(s.tofDistanceBucket);
  const tofFront = ['near', 'study_range'].includes(s.tofDistanceBucket);
  const tofAbsentOrFar = ['none', 'far', 'out_of_range'].includes(s.tofDistanceBucket);

  if (s.tofBlockedLikely) {
    return result('sensor_blocked', 88, ['TOF_BLOCKED_LIKELY', 'COARSE_ONLY'], 'blocked_sensor_prompt');
  }
  if (!s.radarAvailable && !s.tofAvailable) {
    return result('empty_room', 70, ['RADAR_ABSENT', 'TOF_ABSENT', 'NO_PRESENCE_SIGNAL'], 'sleep');
  }
  if (!s.radarAvailable && s.tofAvailable && !tofNear) {
    return result('uncertain_environment', 45, ['RADAR_UNAVAILABLE', 'TOF_NOT_CONFIRMING_USER'], 'uncertain_calm');
  }
  if (s.radarAvailable && !s.radarOccupied && s.tofAvailable && s.tofDistanceBucket === 'very_near') {
    return result('object_in_front_not_user', 82, ['TOF_VERY_NEAR', 'RADAR_NO_OCCUPANCY'], 'neutral_idle');
  }
  if (s.radarAvailable && !s.radarOccupied && tofAbsentOrFar) {
    return result('empty_room', 80, ['RADAR_EMPTY', 'TOF_EMPTY_OR_FAR'], 'sleep');
  }
  if (s.radarOccupied && s.radarActive && s.tofTrend === 'approaching') {
    return result('active_interaction', radarScore + 10, ['RADAR_ACTIVE', 'TOF_APPROACHING'], 'attention_ready');
  }
  if (s.radarOccupied && s.tofAvailable && tofFront) {
    if (s.radarStationary && s.appFocusNeedBucket === 'high') {
      return result('quiet_study_presence', radarScore + 8, ['RADAR_STATIONARY', 'TOF_FRONT_CONFIRMED', 'APP_FOCUS_HIGH'], 'gentle_check_in');
    }
    return result('user_present_in_front', radarScore + 5, ['RADAR_OCCUPIED', 'TOF_FRONT_CONFIRMED'], 'neutral_idle');
  }
  if (s.radarOccupied && (!s.tofAvailable || tofAbsentOrFar)) {
    if (s.robotRecentlyMoved || s.appStudyLoadBucket === 'high') {
      return result('robot_misaligned', radarScore, ['RADAR_OCCUPIED', 'TOF_NOT_FRONT', 'MISALIGNMENT_POSSIBLE'], 'uncertain_calm');
    }
    return result('user_present_off_axis', radarScore, ['RADAR_OCCUPIED', 'TOF_OUT_OF_FRONT_RANGE'], 'neutral_idle');
  }
  if (!s.radarAvailable && s.tofAvailable && tofNear) {
    return result('uncertain_environment', 55, ['RADAR_UNAVAILABLE', 'TOF_ONLY_NEAR_SIGNAL'], 'uncertain_calm');
  }
  return result('uncertain_environment', 40, ['SENSING_AMBIGUOUS'], 'uncertain_calm');
}
