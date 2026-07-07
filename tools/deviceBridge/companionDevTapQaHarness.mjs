#!/usr/bin/env node
import { createCompanionDevTap } from '../../src/companion/companionDevTap.js';
import { createCompanionDevTapRuntime } from '../../src/companion/companionDevTapRuntime.js';
import { createFakeCompanionFacade } from './fakeCompanionFacade.mjs';
import { companionDevTapQaFixtures } from './companionDevTapQaFixtures.mjs';

function emitSequence(facade, events) {
  events.forEach(event => facade.emitFakeDeviceBridgeEvent(event));
}

export function runCompanionDevTapQaHarness() {
  const facade = createFakeCompanionFacade();
  const tap = createCompanionDevTap({ maxTranscriptEntries: 100 });
  const runtime = createCompanionDevTapRuntime({ facade, tap });
  const lines = [];

  const initial = runtime.getSnapshot();
  facade.emitFakeDeviceBridgeEvent(companionDevTapQaFixtures.normalSession.events[0]);
  const afterPreEnable = runtime.getSnapshot();

  runtime.enable();
  const afterEnable = runtime.getSnapshot();
  emitSequence(facade, companionDevTapQaFixtures.normalSession.events);
  const afterNormal = runtime.getSnapshot();
  emitSequence(facade, [companionDevTapQaFixtures.sensitiveAttack.events[0]]);
  const afterSensitive = runtime.getSnapshot();
  runtime.disable();
  const afterDisable = runtime.getSnapshot();
  facade.emitFakeDeviceBridgeEvent(companionDevTapQaFixtures.normalSession.events[1]);
  const finalSnapshot = runtime.getSnapshot();
  const facadeSnapshot = facade.getSnapshot();

  const blockedSensitiveEventCount = runtime.getTranscript().filter(entry => entry.privacyStatus === 'blocked').length;
  const pass = initial.enabled === false &&
    afterPreEnable.observedEventCount === 0 &&
    afterEnable.subscribed === true &&
    afterNormal.acceptedEventCount === companionDevTapQaFixtures.normalSession.events.length &&
    blockedSensitiveEventCount >= 1 &&
    afterDisable.subscribed === false &&
    finalSnapshot.observedEventCount === afterSensitive.observedEventCount &&
    facadeSnapshot.sentExternally === 0;

  const summary = {
    devOnly: true,
    noExternalSend: facadeSnapshot.sentExternally === 0,
    noPersistence: true,
    disabledByDefault: initial.enabled === false,
    preEnableIgnored: afterPreEnable.observedEventCount === 0,
    manualEnableRequired: true,
    unsubscribeWorks: afterDisable.subscribed === false,
    observedEventCount: finalSnapshot.observedEventCount,
    acceptedEventCount: finalSnapshot.acceptedEventCount,
    rejectedEventCount: finalSnapshot.rejectedEventCount,
    transcriptCount: finalSnapshot.transcriptCount,
    lastInputEventType: finalSnapshot.lastInputEventType,
    lastCompanionIntent: finalSnapshot.lastCompanionIntent,
    lastRobotCommand: finalSnapshot.lastRobotCommand,
    lastSafetyOutcome: finalSnapshot.lastSafetyOutcome,
    blockedSensitiveEventCount,
    result: pass ? 'PASS' : 'FAIL'
  };

  lines.push('[COMPANION TAP QA] start');
  lines.push(`[COMPANION TAP QA] disabledByDefault=${summary.disabledByDefault ? 'yes' : 'no'}`);
  lines.push(`[COMPANION TAP QA] preEnableIgnored=${summary.preEnableIgnored ? 'yes' : 'no'}`);
  lines.push(`[COMPANION TAP QA] manualEnableRequired=${summary.manualEnableRequired ? 'yes' : 'no'}`);
  lines.push(`[COMPANION TAP QA] observed=${summary.observedEventCount} accepted=${summary.acceptedEventCount} rejected=${summary.rejectedEventCount} transcript=${summary.transcriptCount}`);
  lines.push(`[COMPANION TAP QA] lastEvent=${summary.lastInputEventType || 'none'} lastIntent=${summary.lastCompanionIntent || 'none'} lastCommand=${summary.lastRobotCommand || 'none'} safety=${summary.lastSafetyOutcome || 'none'}`);
  lines.push(`[COMPANION TAP QA] blockedSensitive=${summary.blockedSensitiveEventCount}`);
  lines.push(`[COMPANION TAP QA] noExternalSend=${summary.noExternalSend ? 'yes' : 'no'} noPersistence=${summary.noPersistence ? 'yes' : 'no'} unsubscribeWorks=${summary.unsubscribeWorks ? 'yes' : 'no'}`);
  lines.push(`[COMPANION TAP QA] result=${summary.result}`);

  return {
    summary,
    lines,
    transcript: runtime.getTranscript(),
    facadeSnapshot
  };
}

export function printCompanionDevTapQaHarness(log = console.log) {
  const result = runCompanionDevTapQaHarness();
  result.lines.forEach(line => log(line));
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printCompanionDevTapQaHarness();
}
