import { describe, expect, it } from 'vitest';
import {
  getUiString,
  SHIME_LOCALES,
  SHIME_DEFAULT_LOCALE,
  SHIME_TERMINOLOGY
} from '../../src/uiI18n/shimeUiCopyProposal.js';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const proposalPath = resolve(PROJECT_ROOT, 'src/uiI18n/shimeUiCopyProposal.js');
const proposalSource = fs.readFileSync(proposalPath, 'utf8');

describe('shimeUiCopyProposal isolated tests', () => {
  it('defaults to Vietnamese', () => {
    expect(SHIME_DEFAULT_LOCALE).toBe(SHIME_LOCALES.VI);
    expect(getUiString('shimeRobot')).toBe('Robot Shime');
  });

  it('provides English as a preview locale option', () => {
    expect(SHIME_LOCALES.EN).toBe('en');
    expect(getUiString('shimeRobot', 'en')).toBe('Shime Robot');
  });

  it('falls back to Vietnamese for unknown locales', () => {
    expect(getUiString('shimeRobot', 'fr')).toBe('Robot Shime');
    expect(getUiString('shimeRobot', 'jp')).toBe('Robot Shime');
  });

  it('returns key string literal if key is completely missing', () => {
    expect(getUiString('completely_missing_key')).toBe('completely_missing_key');
  });

  it('satisfies Shime terminology requirements', () => {
    const viTerms = SHIME_TERMINOLOGY.vi;
    const enTerms = SHIME_TERMINOLOGY.en;

    expect(viTerms.shimeRobot).toBe('Robot Shime');
    expect(enTerms.shimeRobot).toBe('Shime Robot');
    expect(viTerms.shimeQuiz).toBe('Shime Quiz');
    expect(enTerms.shimeQuiz).toBe('Shime Quiz');
    expect(viTerms.companionControlCenter).toBe('Trung tâm điều khiển Trợ lý Đồng Hành');
    expect(enTerms.companionControlCenter).toBe('Companion Control Center');
    expect(viTerms.deviceBridge).toBe('Cầu nối thiết bị');
    expect(enTerms.deviceBridge).toBe('Device Bridge');
    expect(viTerms.cognitiveEngineV2).toBe('Não đồng hành V2');
    expect(enTerms.cognitiveEngineV2).toBe('Cognitive Engine V2');
    expect(viTerms.dryRun).toBe('chạy thử khô');
    expect(enTerms.dryRun).toBe('dry-run');
    expect(viTerms.notSent).toBe('không gửi');
    expect(enTerms.notSent).toBe('not sent');
    expect(viTerms.redactedCoarseData).toBe('dữ liệu đã làm mờ/rút gọn');
    expect(enTerms.redactedCoarseData).toBe('redacted/coarse data');
    expect(viTerms.learningStateCapsule).toBe('capsule trạng thái học tập');
    expect(enTerms.learningStateCapsule).toBe('Learning State Capsule');
    expect(viTerms.memoryBrain).toBe('bộ não trí nhớ');
    expect(enTerms.memoryBrain).toBe('Memory Brain');
    expect(viTerms.transportBrain).toBe('bộ não kết nối');
    expect(enTerms.transportBrain).toBe('Transport Brain');
    expect(viTerms.safetyGovernor).toBe('bộ điều phối an toàn');
    expect(enTerms.safetyGovernor).toBe('Safety Governor');
    expect(viTerms.fsrsMemorySignal).toBe('tín hiệu trí nhớ FSRS');
    expect(enTerms.fsrsMemorySignal).toBe('FSRS memory signal');
  });
});

describe('shimeUiCopyProposal code safety checks', () => {
  it('does not contain storage access or auto-detection', () => {
    expect(proposalSource).not.toContain('localStorage');
    expect(proposalSource).not.toContain('sessionStorage');
    expect(proposalSource).not.toContain('indexedDB');
    expect(proposalSource).not.toContain('navigator.language');
    expect(proposalSource).not.toContain('navigator.languages');
  });
});
