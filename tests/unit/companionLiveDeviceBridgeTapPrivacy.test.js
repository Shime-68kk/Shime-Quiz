import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCompanionDevTapRuntime } from '../../src/companion/companionDevTapRuntime.js';
import {
  findForbiddenCompanionPanelKeys,
  summarizeLiveTapSnapshot
} from '../../src/components/settings/companionDevPanelModel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function createFakeFacade() {
  const listeners = new Set();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emitEvent(event) {
      listeners.forEach(listener => listener({ type: 'facade_event_sent', event }));
    }
  };
}

describe('live DeviceBridge companion tap privacy', () => {
  it('accepts valid DeviceBridge-style redacted events', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    facade.emitEvent({
      eventType: 'question_presented',
      sessionId: 'privacy_live',
      payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 4 }
    });

    expect(runtime.getSnapshot()).toMatchObject({ acceptedEventCount: 1, rejectedEventCount: 0 });
    expect(summarizeLiveTapSnapshot(runtime.getSnapshot(), runtime.getTranscript()).safe).toBe(true);
  });

  it('rejects sensitive events and increments blocked sensitive count', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    facade.emitEvent({
      eventType: 'question_presented',
      sessionId: 'privacy_live',
      payload: { question: 'private text' }
    });

    const live = summarizeLiveTapSnapshot(runtime.getSnapshot(), runtime.getTranscript());
    const serialized = JSON.stringify(live);

    expect(live.rejectedCount).toBe(1);
    expect(live.blockedSensitiveCount).toBe(1);
    expect(live.transcript[0]).toMatchObject({ status: 'rejected', privacyStatus: 'đã chặn bởi lớp bảo mật' });
    expect(serialized).not.toContain('private text');
    expect(serialized).not.toContain('"question"');
  });

  it('live transcript contains no forbidden keys', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    facade.emitEvent({
      eventType: 'answer_correct',
      sessionId: 'privacy_live',
      payload: { itemIndex: 1, itemType: 'flashcard', progressCount: 2, totalCount: 4, status: 'correct' }
    });

    const live = summarizeLiveTapSnapshot(runtime.getSnapshot(), runtime.getTranscript());
    expect(findForbiddenCompanionPanelKeys(live.transcript)).toEqual([]);
  });

  it('panel and model do not use persistence or network APIs', () => {
    const panelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx'), 'utf8');
    const modelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/companionDevPanelModel.js'), 'utf8');
    const combined = `${panelSource}\n${modelSource}`;

    [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'fetch(',
      'XMLHttpRequest',
      'new WebSocket',
      'navigator.bluetooth'
    ].forEach(pattern => {
      expect(combined).not.toContain(pattern);
    });
  });
});
