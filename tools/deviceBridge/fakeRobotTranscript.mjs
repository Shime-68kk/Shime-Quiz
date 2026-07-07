#!/usr/bin/env node
import {
  getRobotActionForEvent,
  getValidRobotEventFixtures,
  protocolFixtures
} from './protocolFixtures.mjs';

export function createFakeRobotTranscript() {
  const lines = [
    '[FAKE ROBOT TRANSCRIPT] start',
    `[FAKE ROBOT TRANSCRIPT] receive ${protocolFixtures.hello.messageType} -> send hello_ack`
  ];

  getValidRobotEventFixtures().forEach(fixture => {
    lines.push(`[FAKE ROBOT TRANSCRIPT] receive ${fixture.payload.eventType} -> action ${getRobotActionForEvent(fixture.payload.eventType)}`);
  });

  lines.push('[FAKE ROBOT TRANSCRIPT] end');
  return lines;
}

export function printFakeRobotTranscript(log = console.log) {
  const lines = createFakeRobotTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printFakeRobotTranscript();
}

