#!/usr/bin/env node
import { runCompanionDevTapQaHarness } from './companionDevTapQaHarness.mjs';

export function createCompanionDevTapQaTranscript() {
  const result = runCompanionDevTapQaHarness();
  const lines = [
    '[COMPANION TAP TRANSCRIPT] dev-only fake facade QA',
    '[COMPANION TAP TRANSCRIPT] simulated only; no external robot send'
  ];

  result.transcript.forEach(entry => {
    lines.push(`[COMPANION TAP TRANSCRIPT] event=${entry.inputEventType} accepted=${entry.accepted ? 'yes' : 'no'} intent=${entry.companionIntent} safety=${entry.safetyOutcome} command=${entry.robotCommand} privacy=${entry.privacyStatus}`);
  });

  lines.push(`[COMPANION TAP TRANSCRIPT] result=${result.summary.result}`);
  return lines;
}

export function printCompanionDevTapQaTranscript(log = console.log) {
  const lines = createCompanionDevTapQaTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printCompanionDevTapQaTranscript();
}
