#!/usr/bin/env node
import {
  getInvalidSerialParserQaFixtures,
  getValidSerialParserQaFixtures,
  serialParserQaFixtures
} from './serialParserQaFixtures.mjs';

function acceptedLine(fixture) {
  const detail = fixture.expected.eventType || fixture.expected.command || '';
  return `[SHIME SERIAL QA] accepted ${fixture.expected.kind}${detail ? ` ${detail}` : ''}`;
}

function rejectedLine(fixture) {
  return `[SHIME SERIAL QA] rejected ${fixture.expected.reason}`;
}

export function createFakeSerialParserTranscript() {
  const lines = [
    '[SHIME ROBOT SKELETON] boot',
    '[SHIME ROBOT SKELETON] No Wi-Fi credentials are configured in this skeleton.',
    '[SHIME ROBOT SKELETON] Future WebSocket setup belongs here after safety review.',
    '[SHIME ROBOT SKELETON] No pins, motors, servos, or LEDs are controlled by default.',
    '[SHIME SERIAL QA] Paste one protocol JSON message per line.'
  ];

  getValidSerialParserQaFixtures().forEach(fixture => {
    lines.push(`[HOST] ${fixture.name}`);
    lines.push('[SHIME SERIAL QA] received');
    lines.push(acceptedLine(fixture));
    if (fixture.expected.action) {
      lines.push(`[SHIME ROBOT SKELETON] action stub: ${fixture.expected.action}`);
    }
    lines.push('[SHIME SERIAL QA] response {...}');
  });

  getInvalidSerialParserQaFixtures().forEach(fixture => {
    lines.push(`[HOST] ${fixture.name}`);
    lines.push('[SHIME SERIAL QA] received');
    lines.push(rejectedLine(fixture));
    lines.push('[SHIME SERIAL QA] response {...}');
  });

  lines.push(`[HOST] copyable sample: ${serialParserQaFixtures.questionPresented.input}`);
  lines.push('[SHIME SERIAL QA] transcript end');
  return lines;
}

export function printFakeSerialParserTranscript(log = console.log) {
  const lines = createFakeSerialParserTranscript();
  lines.forEach(line => log(line));
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  printFakeSerialParserTranscript();
}
