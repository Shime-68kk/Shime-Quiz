const PROTOCOLS = Object.freeze([
  ['front_user_60cm', 'User sits centered about 60 cm from robot', 'user_present_in_front'],
  ['off_axis_left_50cm', 'User sits left of robot front cone at about 50 cm', 'user_present_off_axis'],
  ['off_axis_right_50cm', 'User sits right of robot front cone at about 50 cm', 'user_present_off_axis'],
  ['rotated_robot_30deg', 'Robot body rotated about 30 degrees away from user', 'robot_misaligned'],
  ['rotated_robot_60deg', 'Robot body rotated about 60 degrees away from user', 'robot_misaligned'],
  ['blocked_tof_book', 'Book blocks front distance sensor', 'sensor_blocked'],
  ['empty_room_30s', 'No person in room for 30 seconds', 'empty_room'],
  ['fan_noise_60s', 'Fan or curtain motion without person near desk', 'empty_room'],
  ['quiet_reading_120s', 'User quietly reads in study range', 'quiet_study_presence'],
  ['child_tamper_hand_close', 'Hand or object very close to front sensor', 'object_in_front_not_user'],
  ['person_walk_by_no_interaction', 'Person walks past robot without sitting', 'user_present_off_axis']
]);

export function createRadarTofTestProtocol() {
  return PROTOCOLS.map(([testId, condition, expectedFusionState]) => ({
    testId,
    setup: 'ESP32-S3 target with HLK-LD2410/LD2410B presence radar and VL53L0X ToF; app simulator remains offline.',
    robotPlacement: 'Place robot on desk at normal study height; intentionally vary rotation for rotation tests.',
    userPlacement: condition,
    environmentCondition: condition,
    durationSeconds: testId.includes('120') ? 120 : testId.includes('60') ? 60 : 30,
    expectedRadarState: expectedFusionState === 'empty_room' ? 'not occupied or noise rejected' : 'coarse presence bucket only',
    expectedTofState: expectedFusionState === 'sensor_blocked' ? 'blocked likely' : 'coarse distance bucket only',
    expectedFusionState,
    passRule: 'Fusion state and behavior match expected state without camera, microphone, cloud, or raw sensor logs.',
    failExamples: ['raw frame required', 'identity inferred', 'sensor blocked but not detected', 'misalignment not surfaced'],
    notes: 'Record only coarse buckets and pass/fail notes.'
  }));
}

export function formatRadarTofProtocolMarkdown() {
  return createRadarTofTestProtocol().map(test => [
    `## ${test.testId}`,
    `- setup: ${test.setup}`,
    `- robotPlacement: ${test.robotPlacement}`,
    `- userPlacement: ${test.userPlacement}`,
    `- environmentCondition: ${test.environmentCondition}`,
    `- durationSeconds: ${test.durationSeconds}`,
    `- expectedFusionState: ${test.expectedFusionState}`,
    `- passRule: ${test.passRule}`
  ].join('\n')).join('\n\n');
}
