import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createFakeRobotTranscript,
  printFakeRobotTranscript
} from '../../tools/deviceBridge/fakeRobotTranscript.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('Device Bridge fake robot transcript', () => {
  it('prints a deterministic redacted/coarse robot protocol transcript', () => {
    const lines = createFakeRobotTranscript();

    expect(lines[0]).toBe('[FAKE ROBOT TRANSCRIPT] start');
    expect(lines.at(-1)).toBe('[FAKE ROBOT TRANSCRIPT] end');
    expect(lines).toContain('[FAKE ROBOT TRANSCRIPT] receive hello -> send hello_ack');
    expect(lines).toContain('[FAKE ROBOT TRANSCRIPT] receive answer_correct -> action celebrate');
    expect(lines).toContain('[FAKE ROBOT TRANSCRIPT] receive answer_wrong -> action encourage');
    expect(lines).toContain('[FAKE ROBOT TRANSCRIPT] receive session_complete -> action session_complete');
  });

  it('logs the same transcript it returns', () => {
    const logged = [];
    const returned = printFakeRobotTranscript(line => logged.push(line));

    expect(returned).toEqual(createFakeRobotTranscript());
    expect(logged).toEqual(returned);
  });

  it('does not include private quiz content in transcript output', () => {
    const serialized = createFakeRobotTranscript().join('\n');

    [
      'prompt',
      'correctAnswer',
      'explanation',
      'userAnswer',
      'sourceMetadata',
      'settings',
      'studyHistory',
      'backupPayload',
      'private answer',
      'private prompt',
      'private explanation'
    ].forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });

  it('new device bridge tools do not persist transcripts or use browser storage', () => {
    [
      'tools/deviceBridge/protocolFixtures.mjs',
      'tools/deviceBridge/fakeRobotTranscript.mjs'
    ].forEach(file => {
      const source = read(file);

      ['writeFile', 'appendFile', 'createWriteStream'].forEach(pattern => {
        expect(source).not.toContain(pattern);
      });

      ['localStorage', 'sessionStorage', 'indexedDB'].forEach(pattern => {
        expect(source).not.toContain(pattern);
      });
    });
  });
});
