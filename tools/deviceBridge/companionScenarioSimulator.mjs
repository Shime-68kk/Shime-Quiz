#!/usr/bin/env node
import { createDefaultCompanionContext } from '../../src/companion/companionContextSchema.js';
import { reduceLearningSignal } from '../../src/companion/learningSignalReducer.js';
import { reduceRobotPresenceSignal } from '../../src/companion/robotPresenceSignalReducer.js';
import { createCompanionDecision } from '../../src/companion/companionPolicyEngine.js';
import { governCompanionDecision } from '../../src/companion/safetyGovernor.js';
import { planRobotIntent } from '../../src/companion/robotIntentPlanner.js';
import { companionScenarioFixtures } from './companionScenarioFixtures.mjs';

export function runCompanionScenario(scenario) {
  let learningState = {};
  let blocked = false;
  const issues = [];

  scenario.events.forEach(event => {
    if (blocked) return;
    const reduced = reduceLearningSignal(event, learningState);
    if (!reduced.ok) {
      blocked = true;
      issues.push(...reduced.issues);
      return;
    }
    learningState = reduced.state;
  });

  const presence = reduceRobotPresenceSignal(scenario.presence || {});
  if (!presence.ok) {
    blocked = true;
    issues.push(...presence.issues);
  }

  const context = createDefaultCompanionContext({
    contextId: `scenario_${scenario.name}`,
    learningState,
    sessionState: { transportStatus: learningState.transportStatus || 'connected' },
    performanceState: learningState,
    robotPresenceState: presence.state,
    safetyState: { safetyMode: 'motion_disabled', privacyLock: !blocked, motionAllowed: false, childSafeMode: true },
    userExperienceMode: scenario.profile || 'calm_companion'
  });

  const decision = blocked
    ? {
        intent: 'calm_error',
        tone: 'quiet',
        urgency: 'high',
        reasonCodes: ['scenario_blocked_by_privacy_reducer'],
        allowedRobotActionFamily: 'neutral',
        shouldSpeak: false,
        shouldMove: false,
        shouldNotify: false
      }
    : createCompanionDecision(context);
  const governed = governCompanionDecision(decision, context, scenario.history || []);
  const intent = planRobotIntent(governed.decision, context, scenario.history || []);

  return {
    name: scenario.name,
    blocked,
    issueCodes: issues.map(entry => entry.code),
    context,
    decision,
    governed,
    intent
  };
}

export function runCompanionScenarios(scenarios = companionScenarioFixtures) {
  return scenarios.map(runCompanionScenario);
}

export function createCompanionScenarioTranscript(scenarios = companionScenarioFixtures) {
  return runCompanionScenarios(scenarios).map(result => [
    `[COMPANION SIM] ${result.name}`,
    `[COMPANION SIM] intent=${result.decision.intent}`,
    `[COMPANION SIM] command=${result.intent.command}`,
    `[COMPANION SIM] blocked=${result.blocked ? 'yes' : 'no'}`,
    `[COMPANION SIM] reasons=${result.intent.reasonCodes.join(',')}`
  ]).flat();
}

export function printCompanionScenarioTranscript(log = console.log) {
  const lines = createCompanionScenarioTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printCompanionScenarioTranscript();
}
