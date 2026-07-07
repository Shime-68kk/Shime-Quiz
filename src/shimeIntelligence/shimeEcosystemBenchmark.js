import { runShimeEcosystemFusion } from './appRobotFusionEngine.js';
import { assertShimeEcosystemInvariants } from './shimeEcosystemInvariants.js';
import { createShimeEcosystemDecisionAudit } from './shimeEcosystemDecisionAudit.js';

function prng(seed = 34000) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (state * 1103515245 + 12345) >>> 0;
    return state / 0x100000000;
  };
}

function pick(rand, values) {
  return values[Math.floor(rand() * values.length) % values.length];
}

export function generateShimeEcosystemScenarios(options = {}) {
  const rand = prng(options.seed || 34000);
  const validLearningCount = options.validLearningCount || 5000;
  const transportCount = options.transportCount || 2000;
  const timetableCount = options.timetableCount || 1000;
  const mixedCount = options.mixedCount || 1000;
  const attackCount = options.attackCount || 1000;
  const scenarios = [];
  const classes = ['normal_review_day', 'no_due_items', 'high_due_pressure', 'overdue_recovery', 'low_retrievability', 'high_stability_gain', 'high_difficulty_cluster', 'repeated_lapse', 'correct_recovery', 'low_accuracy_completion', 'high_accuracy_completion', 'review_streak', 'habit_drift', 'habit_recovery', 'user_tired', 'classroom_safe', 'disconnected_robot', 'robot_display_only', 'robot_led_only', 'robot_motion_capable_locked'];
  for (let i = 0; i < validLearningCount; i += 1) {
    const kind = classes[i % classes.length];
    scenarios.push({
      id: `valid_${i + 1}`,
      kind,
      valid: true,
      input: {
        fsrs: {
          dueCount: kind === 'no_due_items' ? 0 : Math.floor(rand() * 40),
          overdueCount: kind.includes('overdue') || kind.includes('drift') ? 8 : Math.floor(rand() * 5),
          retrievability: kind === 'low_retrievability' ? 0.25 : rand(),
          stability: kind === 'high_stability_gain' ? 45 : Math.floor(rand() * 30),
          difficulty: kind === 'high_difficulty_cluster' ? 8.5 : rand() * 8,
          lapseCount: kind === 'repeated_lapse' ? 4 : Math.floor(rand() * 2),
          reviewStreak: kind === 'review_streak' ? 8 : Math.floor(rand() * 5),
          completionQualityBucket: kind.includes('low_accuracy') ? 'low' : kind.includes('high_accuracy') ? 'high' : 'mixed'
        },
        sessionPhase: kind.includes('completion') || kind.includes('stability') ? 'complete' : 'review',
        companionIntent: kind.includes('recovery') ? 'recovery_praise' : 'focus_gently',
        safetyMode: kind === 'classroom_safe' ? 'classroom_safe' : 'motion_disabled',
        transportHealth: kind === 'disconnected_robot' ? 'disconnected' : 'connected',
        robotAvailability: kind === 'disconnected_robot' ? 'offline' : 'available',
        robotProfile: {
          supportsDisplay: true,
          supportsLed: kind !== 'robot_display_only',
          supportsSound: false,
          supportsMotion: kind === 'robot_motion_capable_locked',
          motionLocked: true
        },
        transport: { userConsentState: 'explicit_yes', isSameLan: true, wifiHealth: 'good', latencyNeedBucket: 'live', payloadSizeBucket: 'tiny' }
      }
    });
  }
  const transportKinds = ['wifi_same_lan_good', 'wifi_weak', 'ble_available', 'ble_unavailable', 'softap_setup', 'serial_dev', 'phone_only', 'desktop_only', 'phone_desktop_robot'];
  for (let i = 0; i < transportCount; i += 1) {
    const kind = transportKinds[i % transportKinds.length];
    scenarios.push({
      id: `transport_${i + 1}`,
      kind,
      valid: true,
      input: {
        fsrs: { dueCount: 2, retrievability: 0.7, stability: 8, difficulty: 4 },
        robotProfile: { supportsWifi: kind.includes('wifi') || kind.includes('robot'), supportsWebSocket: kind.includes('wifi') || kind.includes('robot'), supportsBle: kind.includes('ble'), supportsSoftAp: kind.includes('softap'), supportsUsbSerial: kind.includes('serial'), supportsDisplay: true },
        transport: { userConsentState: 'explicit_yes', isSameLan: kind.includes('same_lan') || kind.includes('robot'), wifiHealth: kind.includes('weak') ? 'weak' : 'good', latencyNeedBucket: 'live', pairingState: kind.includes('ble') ? 'new' : 'paired', softApAvailable: kind.includes('softap'), payloadSizeBucket: 'tiny', appPlatform: kind.includes('serial') ? 'dev' : 'desktop' }
      }
    });
  }
  for (let i = 0; i < timetableCount; i += 1) {
    scenarios.push({
      id: `timetable_${i + 1}`,
      kind: i % 3 === 0 ? 'habit_drift' : i % 3 === 1 ? 'user_tired' : 'habit_recovery',
      valid: true,
      input: {
        fsrs: { dueCount: i % 3 === 0 ? 20 : 1, overdueCount: i % 3 === 0 ? 12 : 0, retrievability: 0.65, stability: 5, difficulty: 5, lapseCount: i % 3 === 2 ? 3 : 0 },
        timetable: { sessionFatigueBucket: i % 3 === 1 ? 'high' : 'low', preferredStudyWindowBucket: pick(rand, ['morning', 'afternoon', 'evening']) },
        robotProfile: { supportsDisplay: true }
      }
    });
  }
  const mixedKinds = ['phone_only', 'desktop_only', 'phone_desktop_robot', 'app_unavailable', 'robot_unavailable'];
  for (let i = 0; i < mixedCount; i += 1) {
    const kind = mixedKinds[i % mixedKinds.length];
    scenarios.push({
      id: `mixed_${i + 1}`,
      kind,
      valid: true,
      input: {
        fsrs: { dueCount: kind === 'app_unavailable' ? 0 : 6, overdueCount: kind === 'phone_desktop_robot' ? 2 : 0, retrievability: 0.62, stability: 12, difficulty: 4, reviewStreak: 4, totalCount: 8 },
        sessionPhase: kind === 'app_unavailable' ? 'idle' : 'review',
        companionIntent: kind === 'robot_unavailable' ? 'neutral_wait' : 'focus_gently',
        robotAvailability: kind === 'robot_unavailable' ? 'offline' : 'available',
        transportHealth: kind === 'app_unavailable' ? 'disabled' : 'connected',
        robotProfile: { supportsWifi: kind.includes('robot'), supportsWebSocket: kind.includes('robot'), supportsBle: kind.includes('phone'), supportsDisplay: true, motionLocked: true },
        transport: { userConsentState: kind.includes('robot') ? 'explicit_yes' : 'not_requested', isSameLan: kind.includes('robot'), wifiHealth: 'good', latencyNeedBucket: 'live', payloadSizeBucket: 'tiny' }
      }
    });
  }
  for (let i = 0; i < attackCount; i += 1) {
    scenarios.push({
      id: `attack_${i + 1}`,
      kind: i % 4 === 0 ? 'sensitive_raw_attack' : i % 4 === 1 ? 'nested_sensitive_attack' : i % 4 === 2 ? 'malformed_capsule' : 'unsafe_transport_request',
      valid: false,
      attack: true,
      input: i % 2 === 0
        ? { fsrs: { question: 'blocked' }, robotProfile: { supportsDisplay: true } }
        : { fsrs: { safe: { correctAnswer: 'blocked' } }, transport: { userConsentState: 'explicit_yes' }, robotProfile: { supportsDisplay: true } }
    });
  }
  return scenarios;
}

export function runShimeEcosystemBenchmark(options = {}) {
  const scenarios = generateShimeEcosystemScenarios(options);
  const expectedCounts = {
    validLearningScenarioCount: options.validLearningCount || 5000,
    transportScenarioCount: options.transportCount || 2000,
    timetableScenarioCount: options.timetableCount || 1000,
    mixedScenarioCount: options.mixedCount || 1000
  };
  const results = scenarios.map(scenario => ({ scenario, result: runShimeEcosystemFusion(scenario.input, { capsuleId: scenario.id }) }));
  const invariantFailures = results.flatMap(({ result }) => assertShimeEcosystemInvariants(result).failures);
  const invalidSafe = results.filter(({ scenario }) => scenario.attack).every(({ result }) => result.learningCapsule.privacyStatus === 'blocked' || ['calm_error', 'do_nothing', 'neutral_presence'].includes(result.robotInterventionPlan.interventionFamily));
  const validReasonCodes = results.filter(({ scenario }) => scenario.valid).every(({ result }) => Array.isArray(result.reasonCodes) && result.reasonCodes.length > 0);
  const dryRunOnly = results.every(({ result }) => result.dryRunOnly === true && result.sendStatus === 'not_sent' && result.robotInterventionPlan.sendStatus === 'not_sent');
  const motionLocked = results.every(({ result }) => result.robotInterventionPlan.suggestedMotionPolicy === 'locked');
  const timetableSuggestionOnly = results.every(({ result }) => (
    result.timetablePlan.mutatesSchedule === false
    && result.timetablePlan.scheduleMutationAllowed === false
    && result.timetablePlan.notificationAllowed === false
    && result.timetablePlan.calendarMutationAllowed === false
  ));
  const transportRecommendationOnly = results.every(({ result }) => result.transportPlan.opensConnection === false);
  const passed = scenarios.length >= 10000 && scenarios.filter(s => s.attack).length >= 1000 && invariantFailures.length === 0 && invalidSafe && validReasonCodes && dryRunOnly && motionLocked && timetableSuggestionOnly && transportRecommendationOnly;
  return {
    scenarioCount: scenarios.length,
    validScenarioCount: scenarios.filter(s => s.valid).length,
    attackScenarioCount: scenarios.filter(s => s.attack).length,
    ...expectedCounts,
    invariantFailureCount: invariantFailures.length,
    dryRunOnly,
    motionLocked,
    timetableSuggestionOnly,
    transportRecommendationOnly,
    invalidSafe,
    validReasonCodes,
    passed,
    auditSample: createShimeEcosystemDecisionAudit(results.slice(0, 20).map(entry => entry.result)),
    sampleResults: results.slice(0, 20).map(entry => entry.result)
  };
}
