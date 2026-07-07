export const SHIME_ECOSYSTEM_ROADMAP_VERSION = 'shime-ecosystem-roadmap-v1';

const STAGES = Object.freeze([
  'Local-first app intelligence',
  'Device Bridge safe event layer',
  'Companion Cognitive Engine V2',
  'FSRS-to-robot learning capsule',
  'Robot expression-only prototype',
  'ESP32 Wi-Fi/BLE capability handshake',
  'Phone/desktop/robot local pairing',
  'Presence-aware routine support',
  'Timetable suggestion engine',
  'Local-only optional AI research',
  'Privacy-preserving personalization',
  'Motion-capable robot future safety phase'
]);

function makeStage(index, goal) {
  const stageNumber = index + 1;
  return {
    stageNumber,
    goal,
    allowedCapabilities: [
      'local_first_state_authority',
      stageNumber >= 4 ? 'redacted_capsule_planning' : 'app_only_planning',
      stageNumber >= 5 ? 'expression_only_robot_preview' : 'no_robot_behavior',
      stageNumber >= 8 ? 'routine_suggestion_dry_run' : 'no_routine_intervention'
    ],
    forbiddenCapabilities: [
      'raw_learning_payload_to_robot',
      'robot_schedule_mutation',
      'cloud_required_runtime',
      'credential_copying',
      'unapproved_motion',
      'notification_or_calendar_mutation'
    ],
    safetyGate: stageNumber >= 12 ? 'new_motion_safety_review_required' : 'dry_run_privacy_gate_required',
    privacyGate: 'capsule_redacted_coarse_only',
    manualQaGate: `phase_${stageNumber}_manual_qa_required`,
    recommendedNextPhase: stageNumber < STAGES.length ? STAGES[stageNumber] : 'post_motion_safety_review_only'
  };
}

export function getShimeEcosystemRoadmap() {
  return {
    roadmapVersion: SHIME_ECOSYSTEM_ROADMAP_VERSION,
    stages: STAGES.map((goal, index) => makeStage(index, goal)),
    defaultRecommendation: 'advance_only_after_manual_qa_and_privacy_gate',
    reasonCodes: ['ecosystem_roadmap_loaded']
  };
}

export function validateShimeEcosystemRoadmap(roadmap = getShimeEcosystemRoadmap()) {
  const failures = [];
  if (roadmap.roadmapVersion !== SHIME_ECOSYSTEM_ROADMAP_VERSION) failures.push('unknown_roadmap_version');
  if (!Array.isArray(roadmap.stages) || roadmap.stages.length !== 12) failures.push('roadmap_must_have_12_stages');
  (roadmap.stages || []).forEach(stage => {
    if (stage.forbiddenCapabilities?.includes('raw_learning_payload_to_robot') !== true) failures.push(`stage_${stage.stageNumber}_missing_raw_payload_forbidden`);
    if (!stage.safetyGate || !stage.privacyGate || !stage.manualQaGate) failures.push(`stage_${stage.stageNumber}_missing_gate`);
  });
  return { ok: failures.length === 0, failures, reasonCodes: ['ecosystem_roadmap_validated'] };
}

export function summarizeShimeEcosystemRoadmap(roadmap = getShimeEcosystemRoadmap()) {
  return {
    roadmapVersion: roadmap.roadmapVersion,
    stageCount: roadmap.stages?.length || 0,
    firstStage: roadmap.stages?.[0]?.goal || 'unknown',
    nextRobotStage: roadmap.stages?.[3]?.goal || 'unknown',
    finalStage: roadmap.stages?.[roadmap.stages.length - 1]?.goal || 'unknown',
    reasonCodes: ['ecosystem_roadmap_summarized']
  };
}
