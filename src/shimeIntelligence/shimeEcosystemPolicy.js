export const SHIME_ECOSYSTEM_POLICY_RULES = Object.freeze([
  'fsrs_memory_model_is_canonical',
  'companion_v2_may_interpret_but_not_override_fsrs',
  'robot_may_express_nudge_and_ritualize_only',
  'timetable_planner_suggests_only',
  'transport_brain_recommends_only',
  'app_keeps_local_first_authority',
  'robot_never_stores_canonical_learning_data',
  'capsule_only_bridge_format',
  'safety_governor_can_block_any_plan',
  'classroom_mode_reduces_intensity',
  'sensitive_data_blocks_robot_output'
]);

export function getShimeEcosystemPolicy() {
  return {
    policyVersion: 'shime-ecosystem-policy-v1',
    rules: [...SHIME_ECOSYSTEM_POLICY_RULES],
    fsrsCanonical: true,
    robotSuggestionOnly: true,
    timetableSuggestionOnly: true,
    capsuleOnlyBridge: true,
    dryRunOnly: true,
    reasonCodes: ['ecosystem_policy_loaded']
  };
}
