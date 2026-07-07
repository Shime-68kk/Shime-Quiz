export const SHIME_PRODUCT_DOCTRINE_VERSION = 'shime-product-doctrine-v1';

const DEFAULT_DOCTRINE = Object.freeze({
  doctrineVersion: SHIME_PRODUCT_DOCTRINE_VERSION,
  ecosystemName: 'Shime',
  robotProductName: 'Shime Robot',
  appProductName: 'Shime Quiz',
  robotPublicRole: 'product_face',
  appPublicRole: 'companion_app',
  appTechnicalRole: 'local_first_learning_brain',
  robotTechnicalRole: 'emotion_body_presence_bridge',
  fsrsRole: 'memory_scheduler_core',
  capsuleRole: 'privacy_safe_bridge',
  safetyRole: 'highest_authority',
  invariants: Object.freeze([
    'app_is_canonical_learning_source',
    'robot_is_not_canonical_learning_source',
    'fsrs_is_canonical_review_scheduler',
    'robot_cannot_mutate_schedule',
    'robot_receives_capsules_only',
    'local_first_authority_preserved',
    'safety_governor_can_block_all_plans'
  ]),
  reasonCodes: Object.freeze(['product_doctrine_loaded'])
});

export function getShimeProductDoctrine() {
  return {
    ...DEFAULT_DOCTRINE,
    invariants: [...DEFAULT_DOCTRINE.invariants],
    reasonCodes: [...DEFAULT_DOCTRINE.reasonCodes]
  };
}

export function validateShimeProductDoctrine(doctrine = getShimeProductDoctrine()) {
  const failures = [];
  if (doctrine.ecosystemName !== 'Shime') failures.push('ecosystem_name_must_be_shime');
  if (doctrine.robotProductName !== 'Shime Robot') failures.push('robot_product_name_mismatch');
  if (doctrine.appProductName !== 'Shime Quiz') failures.push('app_product_name_mismatch');
  if (doctrine.robotPublicRole !== 'product_face') failures.push('robot_not_product_face');
  if (doctrine.appTechnicalRole !== 'local_first_learning_brain') failures.push('app_not_learning_brain');
  if (doctrine.robotTechnicalRole !== 'emotion_body_presence_bridge') failures.push('robot_role_not_endpoint');
  if (doctrine.fsrsRole !== 'memory_scheduler_core') failures.push('fsrs_not_scheduler_core');
  if (doctrine.safetyRole !== 'highest_authority') failures.push('safety_not_highest_authority');
  [
    'app_is_canonical_learning_source',
    'robot_is_not_canonical_learning_source',
    'fsrs_is_canonical_review_scheduler',
    'robot_cannot_mutate_schedule',
    'robot_receives_capsules_only',
    'local_first_authority_preserved',
    'safety_governor_can_block_all_plans'
  ].forEach(invariant => {
    if (!doctrine.invariants?.includes(invariant)) failures.push(`missing_${invariant}`);
  });
  return { ok: failures.length === 0, failures, reasonCodes: ['product_doctrine_validated'] };
}

export function summarizeShimeProductDoctrine(doctrine = getShimeProductDoctrine()) {
  return {
    ecosystemName: doctrine.ecosystemName,
    robotProductName: doctrine.robotProductName,
    appProductName: doctrine.appProductName,
    robotPublicRole: doctrine.robotPublicRole,
    appTechnicalRole: doctrine.appTechnicalRole,
    robotTechnicalRole: doctrine.robotTechnicalRole,
    fsrsRole: doctrine.fsrsRole,
    capsuleRole: doctrine.capsuleRole,
    safetyRole: doctrine.safetyRole,
    invariantCount: Array.isArray(doctrine.invariants) ? doctrine.invariants.length : 0,
    reasonCodes: ['product_doctrine_summarized']
  };
}
