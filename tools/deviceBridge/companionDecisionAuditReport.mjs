#!/usr/bin/env node
import { auditCompanionDecisionSequence } from '../../src/companion/companionDecisionAudit.js';
import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';

export function runCompanionDecisionAuditReport(log = console.log) {
  const fixtures = getCompanionReplayFixtures().slice(0, 3);
  const entries = fixtures.flatMap(fixture => auditCompanionDecisionSequence(fixture.events, fixture.options || {}).map(entry => ({
    scenario: fixture.name,
    step: entry.step,
    inputEventType: entry.inputEventType,
    accepted: entry.accepted,
    policyIntent: entry.policyIntent,
    finalRobotIntent: entry.finalRobotIntent,
    privacyStatus: entry.privacyStatus,
    dryRunOnly: entry.dryRunOnly
  })));
  entries.forEach(entry => log(`[COMPANION V2 AUDIT] ${entry.scenario} step=${entry.step} event=${entry.inputEventType} accepted=${entry.accepted ? 'yes' : 'no'} intent=${entry.policyIntent} command=${entry.finalRobotIntent} privacy=${entry.privacyStatus} dryRun=${entry.dryRunOnly ? 'yes' : 'no'}`));
  return entries;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCompanionDecisionAuditReport();
}

