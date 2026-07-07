import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createCompanionDevTap } from '../../src/companion/companionDevTap.js';
import {
  createAnswerCorrectEvent,
  createQuestionPresentedEvent
} from '../../src/deviceBridge/studyEventFactories.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

describe('companion dev tap Device Bridge integration readiness', () => {
  it('can consume events created by Device Bridge event factories', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    const created = createQuestionPresentedEvent({
      sessionId: 'factory_session',
      itemIndex: 1,
      itemType: 'multiple_choice',
      progressCount: 1,
      totalCount: 3
    });

    expect(created.ok).toBe(true);
    expect(tap.observeDeviceBridgeEvent(created.event).ok).toBe(true);

    const correct = createAnswerCorrectEvent({ sessionId: 'factory_session', progressCount: 2, totalCount: 3 });
    expect(tap.observeDeviceBridgeEvent(correct.event).ok).toBe(true);
    expect(tap.getSnapshot().acceptedEventCount).toBe(2);
  });

  it('rejects malformed Device Bridge-like events', () => {
    const tap = createCompanionDevTap();
    tap.enable();
    const result = tap.observeDeviceBridgeEvent({ eventType: 'raw_event_payload', payload: {} });

    expect(result.ok).toBe(false);
    expect(tap.getSnapshot().rejectedEventCount).toBe(1);
  });

  it('DeviceBridge, StudyRoom, and UI do not import companion dev tap', () => {
    [
      'src/deviceBridge/index.js',
      'src/deviceBridge/deviceBridgeFacade.js',
      'src/deviceBridge/deviceBridgeRuntime.js',
      'src/routes/StudyRoom.jsx',
      'src/components/settings/DeviceBridgeUiConcept.jsx'
    ].forEach(file => {
      const source = read(file);
      expect(source).not.toContain('companionDevTap');
      expect(source).not.toContain('createCompanionDevTap');
      expect(source).not.toContain('../companion');
    });
  });
});
