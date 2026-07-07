import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createFakeSerialParserTranscript,
  printFakeSerialParserTranscript
} from '../../tools/deviceBridge/fakeSerialParserTranscript.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('ESP32 fake serial parser transcript', () => {
  it('includes accepted and rejected examples', () => {
    const lines = createFakeSerialParserTranscript();
    const serialized = lines.join('\n');

    expect(serialized).toContain('[SHIME SERIAL QA] accepted hello');
    expect(serialized).toContain('[SHIME SERIAL QA] accepted robot_event question_presented');
    expect(serialized).toContain('[SHIME SERIAL QA] accepted robot_event answer_correct');
    expect(serialized).toContain('[SHIME SERIAL QA] accepted robot_event answer_wrong');
    expect(serialized).toContain('[SHIME SERIAL QA] rejected sensitive_payload_detected');
    expect(serialized).toContain('[SHIME SERIAL QA] rejected unknown_event');
    expect(serialized).toContain('[SHIME SERIAL QA] rejected unknown_command');
    expect(serialized).toContain('[SHIME SERIAL QA] rejected malformed_message');
  });

  it('logs the same transcript it returns', () => {
    const logged = [];
    const returned = printFakeSerialParserTranscript(line => logged.push(line));

    expect(returned).toEqual(createFakeSerialParserTranscript());
    expect(logged).toEqual(returned);
  });

  it('does not use network, storage, or filesystem writes', () => {
    [
      'tools/deviceBridge/serialParserQaFixtures.mjs',
      'tools/deviceBridge/fakeSerialParserTranscript.mjs'
    ].forEach(file => {
      const source = read(file);

      ['fetch(', 'XMLHttpRequest', 'new WebSocket', 'MQTT', 'Bluetooth', 'localStorage', 'sessionStorage', 'indexedDB'].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
      ['writeFile', 'appendFile', 'createWriteStream'].forEach(pattern => {
        expect(source, `${file} should not write files`).not.toContain(pattern);
      });
    });
  });
});
