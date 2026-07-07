import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PREMIUM_EXPERIENCE_PROFILES } from '../../src/companion/premiumExperienceProfiles.js';
import { collectForbiddenCompanionKeys } from '../../src/companion/companionContextSchema.js';
import { companionScenarioFixtures } from '../../tools/deviceBridge/companionScenarioFixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function listFiles(dir) {
  return fs.readdirSync(resolve(PROJECT_ROOT, dir)).map(file => `${dir}/${file}`);
}

describe('companion privacy and safety boundaries', () => {
  it('premium profiles do not contain privacy-affecting fields', () => {
    Object.values(PREMIUM_EXPERIENCE_PROFILES).forEach(profile => {
      expect(collectForbiddenCompanionKeys(profile)).toEqual([]);
    });
  });

  it('valid companion scenarios contain no forbidden keys', () => {
    companionScenarioFixtures
      .filter(scenario => scenario.name !== 'sensitive_payload_attack')
      .forEach(scenario => {
        expect(collectForbiddenCompanionKeys(scenario), scenario.name).toEqual([]);
      });
  });

  it('companion source has no storage, network, hardware, or AI provider tokens outside forbidden lists', () => {
    listFiles('src/companion').forEach(file => {
      const source = read(file);
      ['localStorage', 'sessionStorage', 'indexedDB', 'fetch', 'XMLHttpRequest', 'WebSocket', 'MQTT', 'Bluetooth', 'getUserMedia', 'API_KEY', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'credentials', 'password'].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('does not wire companion kernel into app runtime, UI, or StudyRoom', () => {
    [
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx',
      'src/deviceBridge/index.js',
      'src/main.jsx'
    ].forEach(file => {
      expect(read(file), `${file} should not import companion`).not.toContain('src/companion');
      expect(read(file), `${file} should not import companion`).not.toContain('../companion');
      expect(read(file), `${file} should not import companion`).not.toContain('./companion');
    });
  });

  it('package dependencies were not expanded for companion work', () => {
    const packageJson = JSON.parse(read('package.json'));

    expect(packageJson.dependencies).not.toHaveProperty('openai');
    expect(packageJson.dependencies).not.toHaveProperty('@anthropic-ai/sdk');
    expect(packageJson.dependencies).not.toHaveProperty('@google/generative-ai');
  });
});
