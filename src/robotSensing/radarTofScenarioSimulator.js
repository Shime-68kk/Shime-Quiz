import { fuseRadarTofPresence } from './radarTofFusionModel.js';

const base = Object.freeze({
  radarAvailable: true, radarOccupied: false, radarActive: false, radarStationary: false, radarConfidenceBucket: 'high',
  tofAvailable: true, tofDistanceBucket: 'out_of_range', tofTrend: 'stable', tofBlockedLikely: false,
  robotRecentlyMoved: false, appFocusNeedBucket: 'none', appStudyLoadBucket: 'none'
});

const SCENARIOS = Object.freeze({
  empty_room: { input: { ...base }, expectedFusionState: 'empty_room', expectedBehavior: 'sleep' },
  user_front_60cm: { input: { ...base, radarOccupied: true, radarStationary: true, tofDistanceBucket: 'study_range' }, expectedFusionState: 'user_present_in_front', expectedBehavior: 'neutral_idle' },
  user_sits_off_axis_left: { input: { ...base, radarOccupied: true, tofDistanceBucket: 'out_of_range' }, expectedFusionState: 'user_present_off_axis', expectedBehavior: 'neutral_idle' },
  user_sits_off_axis_right: { input: { ...base, radarOccupied: true, tofDistanceBucket: 'far' }, expectedFusionState: 'user_present_off_axis', expectedBehavior: 'neutral_idle' },
  robot_rotated_30deg: { input: { ...base, radarOccupied: true, robotRecentlyMoved: true, tofDistanceBucket: 'far' }, expectedFusionState: 'robot_misaligned', expectedBehavior: 'uncertain_calm' },
  robot_rotated_60deg: { input: { ...base, radarOccupied: true, robotRecentlyMoved: true, tofDistanceBucket: 'out_of_range', appStudyLoadBucket: 'high' }, expectedFusionState: 'robot_misaligned', expectedBehavior: 'uncertain_calm' },
  tof_blocked_by_book: { input: { ...base, radarOccupied: true, tofBlockedLikely: true, tofDistanceBucket: 'very_near' }, expectedFusionState: 'sensor_blocked', expectedBehavior: 'blocked_sensor_prompt' },
  child_tamper_hand_close: { input: { ...base, radarOccupied: false, tofDistanceBucket: 'very_near' }, expectedFusionState: 'object_in_front_not_user', expectedBehavior: 'neutral_idle' },
  quiet_reading_stationary_user: { input: { ...base, radarOccupied: true, radarStationary: true, tofDistanceBucket: 'study_range', appFocusNeedBucket: 'high' }, expectedFusionState: 'quiet_study_presence', expectedBehavior: 'gentle_check_in' },
  active_user_returning: { input: { ...base, radarOccupied: true, radarActive: true, tofDistanceBucket: 'near', tofTrend: 'approaching' }, expectedFusionState: 'active_interaction', expectedBehavior: 'attention_ready' },
  person_walks_by: { input: { ...base, radarOccupied: true, radarActive: true, tofDistanceBucket: 'out_of_range', tofTrend: 'leaving', radarConfidenceBucket: 'medium' }, expectedFusionState: 'user_present_off_axis', expectedBehavior: 'neutral_idle' },
  fan_or_curtain_motion_noise: { input: { ...base, radarOccupied: false, radarActive: true, radarConfidenceBucket: 'low', tofDistanceBucket: 'out_of_range' }, expectedFusionState: 'empty_room', expectedBehavior: 'sleep' },
  radar_unavailable_tof_only: { input: { ...base, radarAvailable: false, tofDistanceBucket: 'near' }, expectedFusionState: 'uncertain_environment', expectedBehavior: 'uncertain_calm' },
  tof_unavailable_radar_only: { input: { ...base, tofAvailable: false, tofDistanceBucket: 'none', radarOccupied: true }, expectedFusionState: 'user_present_off_axis', expectedBehavior: 'neutral_idle' }
});

export function getRadarTofScenarioIds() {
  return Object.keys(SCENARIOS);
}

export function getRadarTofScenario(id) {
  const scenario = SCENARIOS[id];
  if (!scenario) return null;
  const actual = fuseRadarTofPresence(scenario.input);
  return {
    scenarioId: id,
    steps: [{ stepId: `${id}_step_1`, input: scenario.input }],
    expectedFusionState: scenario.expectedFusionState,
    expectedBehavior: scenario.expectedBehavior,
    passCriteria: ['actual_state_matches_expected', 'actual_behavior_matches_expected', 'safe_coarse_sensing_only'],
    explanationCodes: actual.evidenceCodes,
    actual,
    passed: actual.fusionState === scenario.expectedFusionState && actual.recommendedRobotBehavior === scenario.expectedBehavior
  };
}

export function runRadarTofScenario(id) {
  return getRadarTofScenario(id);
}

export function runAllRadarTofScenarios() {
  return getRadarTofScenarioIds().map(getRadarTofScenario);
}
