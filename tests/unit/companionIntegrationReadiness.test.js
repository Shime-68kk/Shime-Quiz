import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEVICE_EVENT_TYPES } from '../../src/deviceBridge/deviceEventSchema.js';
import {
  COMPANION_LEARNING_EVENT_TYPES,
  reduceLearningSignal,
  createDefaultCompanionContext,
  createCompanionDecision,
  planRobotIntent,
  SAFE_ROBOT_COMMANDS
} from '../../src/companion/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('companion integration readiness', () => {
  it('can reduce existing Device Bridge event types into companion-safe learning signals', () => {
    [
      DEVICE_EVENT_TYPES.SESSION_STARTED,
      DEVICE_EVENT_TYPES.QUESTION_PRESENTED,
      DEVICE_EVENT_TYPES.ANSWER_CORRECT,
      DEVICE_EVENT_TYPES.ANSWER_WRONG,
      DEVICE_EVENT_TYPES.REVIEW_DUE,
      DEVICE_EVENT_TYPES.SESSION_COMPLETE,
      DEVICE_EVENT_TYPES.BRIDGE_ERROR
    ].forEach(eventType => {
      expect(COMPANION_LEARNING_EVENT_TYPES).toContain(eventType);
      expect(reduceLearningSignal({ eventType, payload: { itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } }).ok).toBe(true);
    });
  });

  it('accepts StudyRoom-style coarse payloads and rejects raw payloads', () => {
    expect(reduceLearningSignal({
      eventType: DEVICE_EVENT_TYPES.ANSWER_WRONG,
      payload: {
        itemIndex: 1,
        itemType: 'short_answer',
        progressCount: 2,
        totalCount: 5,
        status: 'wrong'
      }
    }).ok).toBe(true);

    const rejected = reduceLearningSignal({
      eventType: DEVICE_EVENT_TYPES.ANSWER_CORRECT,
      payload: {
        userAnswer: 'private typed answer'
      }
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.issues[0].code).toBe('forbidden_companion_key');
  });

  it('rejects malformed or unknown events before policy planning', () => {
    expect(reduceLearningSignal(null).issues[0].code).toBe('invalid_learning_event');
    expect(reduceLearningSignal({ eventType: 'unknown_event', payload: {} }).issues[0].code).toBe('unknown_learning_event_type');
  });

  it('maps companion output to existing safe robot command names', () => {
    const context = createDefaultCompanionContext({
      learningState: { sessionPhase: 'question' },
      sessionState: { transportStatus: 'connected' }
    });
    const decision = createCompanionDecision(context);
    const intent = planRobotIntent(decision, context);

    expect(SAFE_ROBOT_COMMANDS).toContain(intent.command);
    expect(intent.command).toBe('focus');
  });

  it('companion source imports no app runtime, UI, firmware, DOM, storage, network, or AI modules', () => {
    fs.readdirSync(resolve(PROJECT_ROOT, 'src/companion')).forEach(file => {
      const source = read(`src/companion/${file}`);
      [
        'react',
        'StudyRoom',
        'deviceBridgeFacade',
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'fetch(',
        'XMLHttpRequest',
        'WebSocket',
        'firmware/',
        'document.',
        'window.',
        'OPENAI',
        'ANTHROPIC',
        'GEMINI'
      ].forEach(pattern => {
        expect(source, `${file} should not contain ${pattern}`).not.toContain(pattern);
      });
    });
  });

  it('Device Bridge, StudyRoom, and UI do not import companion yet', () => {
    [
      'src/deviceBridge/index.js',
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/studyRoomBridgeAdapter.js',
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx'
    ].forEach(file => {
      const source = read(file);
      expect(source).not.toContain('../companion');
      expect(source).not.toContain('./companion');
      expect(source).not.toContain('src/companion');
    });
  });
});
