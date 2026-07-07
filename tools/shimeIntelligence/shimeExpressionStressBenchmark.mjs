import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runShimeEcosystemFusion } from '../../src/shimeIntelligence/appRobotFusionEngine.js';
import { mapFusionToRobotExpression } from '../../src/shimeIntelligence/robotExpressionMapper.js';
import { assertRobotExpressionSafety } from '../../src/shimeIntelligence/robotExpressionSafetyGate.js';
import { findSensitiveKeys } from '../../src/shimeIntelligence/shimeEcosystemInvariants.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function scenarioInput(index, attack = false) {
  if (attack) return { fsrs: { question: 'blocked' }, robotProfile: { supportsDisplay: true } };
  const kind = index % 10;
  return {
    fsrs: {
      dueCount: kind === 0 ? 40 : kind === 1 ? 0 : 5 + (index % 12),
      overdueCount: kind === 2 ? 9 : 0,
      retrievability: kind === 3 ? 0.25 : 0.45 + ((index % 50) / 100),
      stability: kind === 4 ? 45 : 2 + (index % 30),
      difficulty: kind === 5 ? 8.5 : 3 + (index % 5),
      lapseCount: kind === 6 ? 4 : index % 2,
      totalCount: 6 + (index % 20)
    },
    sessionPhase: kind === 4 || kind === 7 ? 'complete' : 'review',
    transportHealth: kind === 8 ? 'disconnected' : 'connected',
    robotAvailability: kind === 9 ? 'offline' : 'available',
    safetyMode: kind === 7 ? 'classroom_safe' : 'motion_disabled',
    robotProfile: {
      supportsDisplay: kind !== 6,
      supportsLed: kind !== 5,
      supportsSound: kind === 4,
      supportsMotion: kind === 7,
      motionLocked: true
    }
  };
}

export function runShimeExpressionStressBenchmark(options = {}) {
  const validCount = options.validCount || 20000;
  const attackCount = options.attackCount || 2000;
  const validPlans = Array.from({ length: validCount }, (_, index) => {
    const input = scenarioInput(index, false);
    const fusion = runShimeEcosystemFusion(input, { capsuleId: `expression_valid_${index}` });
    return mapFusionToRobotExpression({ ...fusion, robotCapabilityProfile: input.robotProfile, safetyMode: input.safetyMode, transportHealth: input.transportHealth, robotAvailability: input.robotAvailability });
  });
  const attackPlans = Array.from({ length: attackCount }, (_, index) => {
    const input = scenarioInput(index, true);
    const fusion = runShimeEcosystemFusion(input, { capsuleId: `expression_attack_${index}` });
    return mapFusionToRobotExpression({ ...fusion, robotCapabilityProfile: input.robotProfile });
  });
  const allPlans = [...validPlans, ...attackPlans];
  const safetyResults = allPlans.map(assertRobotExpressionSafety);
  const noSensitiveOutput = allPlans.every(plan => findSensitiveKeys(plan).length === 0);
  const allDryRun = allPlans.every(plan => plan.dryRunOnly === true);
  const allNotSent = allPlans.every(plan => plan.sendStatus === 'not_sent');
  const motionLocked = allPlans.every(plan => plan.motionPolicy === 'locked');
  const noForbiddenChannel = safetyResults.every(result => !result.failures.some(failure => String(failure).includes('forbidden_channel')));
  const noScheduleMutation = allPlans.every(plan => plan.scheduleMutationAllowed === false && plan.mutatesSchedule !== true);
  const noNotificationCalendar = allPlans.every(plan => plan.notificationAllowed === false && plan.calendarMutationAllowed === false);
  const noTransportConnect = allPlans.every(plan => plan.opensConnection === false);
  const reasonCodes = allPlans.every(plan => Array.isArray(plan.reasonCodes) && plan.reasonCodes.length > 0);
  const invalidNeutralized = attackPlans.every(plan => ['calm_error', 'do_nothing', 'neutral_presence'].includes(plan.expressionFamily) || plan.privacyStatus === 'blocked');
  const passed = validCount >= 20000 && attackCount >= 2000 && safetyResults.every(result => result.ok) && noSensitiveOutput && allDryRun && allNotSent && motionLocked && noForbiddenChannel && noScheduleMutation && noNotificationCalendar && noTransportConnect && reasonCodes && invalidNeutralized;
  return {
    status: passed ? 'PASS' : 'FAIL',
    scenarioCount: validCount + attackCount,
    validScenarioCount: validCount,
    attackScenarioCount: attackCount,
    noSensitiveOutput,
    allDryRun,
    allNotSent,
    motionLocked,
    noForbiddenChannel,
    noScheduleMutation,
    noNotificationCalendar,
    noTransportConnect,
    reasonCodes,
    invalidNeutralized,
    safetyFailureCount: safetyResults.filter(result => !result.ok).length,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function runShimeExpressionStressBenchmarkReport() {
  const report = runShimeExpressionStressBenchmark();
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-expression-stress-benchmark.json'), report);
  const safetyArtifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-expression-safety-audit.json'), {
    status: report.status,
    noSensitiveOutput: report.noSensitiveOutput,
    motionLocked: report.motionLocked,
    allDryRun: report.allDryRun,
    allNotSent: report.allNotSent,
    noForbiddenChannel: report.noForbiddenChannel,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  });
  return { report, artifacts: [artifact, safetyArtifact] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifacts } = runShimeExpressionStressBenchmarkReport();
  console.log(`[SHIME EXPRESSION STRESS] status=${report.status} scenarios=${report.scenarioCount} attacks=${report.attackScenarioCount}`);
  artifacts.forEach(file => console.log(`[ARTIFACT] ${path.relative(ROOT, file)}`));
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
