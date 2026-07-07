export function createShimeEcosystemEvidence(benchmark) {
  return {
    summary: {
      status: benchmark.passed ? 'PASS' : 'FAIL',
      scenarioCount: benchmark.scenarioCount,
      validScenarioCount: benchmark.validScenarioCount,
      attackScenarioCount: benchmark.attackScenarioCount,
      invariantFailureCount: benchmark.invariantFailureCount,
      dryRunOnly: benchmark.dryRunOnly,
      motionLocked: benchmark.motionLocked,
      timetableSuggestionOnly: benchmark.timetableSuggestionOnly,
      transportRecommendationOnly: benchmark.transportRecommendationOnly,
      recommendation: benchmark.passed ? 'SAFE_FOR_PHASE_35_SHIME_ECOSYSTEM_FUSION_REVIEW' : 'SAFE_FOR_PHASE_35_MORE_SHIME_INTELLIGENCE_HARDENING'
    },
    goldenCapsules: benchmark.sampleResults.map((result, index) => ({
      capsuleId: `capsule_${String(index + 1).padStart(3, '0')}`,
      memoryPressureBucket: result.learningCapsule.memoryPressureBucket,
      forgettingRiskBucket: result.learningCapsule.forgettingRiskBucket,
      reviewUrgencyBucket: result.learningCapsule.reviewUrgencyBucket,
      privacyStatus: result.learningCapsule.privacyStatus,
      dryRunOnly: true
    })),
    transportSimulation: [
      { scenarioId: 'transport_wifi_lan_001', recommendation: 'wifi_websocket_lan', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_ble_pairing_001', recommendation: 'ble_provisioning', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_ble_presence_001', recommendation: 'ble_presence', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_softap_setup_001', recommendation: 'softap_setup', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_usb_dev_001', recommendation: 'usb_serial_dev', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_local_only_001', recommendation: 'app_local_only', opensConnection: false, dryRunOnly: true },
      { scenarioId: 'transport_privacy_block_001', recommendation: 'no_transport_safe', opensConnection: false, dryRunOnly: true }
    ],
    timetableScenarios: benchmark.sampleResults.map((result, index) => ({
      scenarioId: `routine_${String(index + 1).padStart(3, '0')}`,
      routineRecommendation: result.timetablePlan.routineRecommendation,
      mutatesSchedule: false
    })),
    auditSample: benchmark.auditSample
  };
}
