import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createStudyRoomBridgeAdapter } from '../../src/deviceBridge/studyRoomBridgeAdapter.js';

function makeInput(overrides = {}) {
  return {
    sessionId: 'session_studyroom_adapter_1',
    itemIndex: 0,
    itemType: 'flashcard',
    progressCount: 1,
    totalCount: 5,
    ...overrides
  };
}

function expectOnlyPayloadKeys(event, expectedKeys) {
  expect(Object.keys(event.payload).sort()).toEqual([...expectedKeys].sort());
}

describe('studyRoomBridgeAdapter', () => {
  it('defaults disabled', () => {
    const adapter = createStudyRoomBridgeAdapter();

    expect(adapter.getSnapshot()).toMatchObject({
      enabled: false,
      connected: false,
      bridgeStatus: 'disabled',
      transportStatus: 'none'
    });
  });

  it('disabled adapter emits safe failure', () => {
    const adapter = createStudyRoomBridgeAdapter();

    const result = adapter.sessionStarted(makeInput({ progressCount: 0 }));

    expect(result).toMatchObject({
      ok: false,
      reason: 'bridge_disabled'
    });
    expect(adapter.getDebugEvents()).toEqual([]);
  });

  it('enabled and mock connected adapter can emit sessionStarted', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.sessionStarted(makeInput({ progressCount: 0 }));

    expect(result.ok).toBe(true);
    expect(result.event.eventType).toBe('session_started');
    expect(adapter.getDebugEvents()).toHaveLength(1);
  });

  it('questionPresented emits only safe fields', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.questionPresented(makeInput());

    expect(result.ok).toBe(true);
    expect(result.event.payload).toEqual({
      itemIndex: 0,
      itemType: 'flashcard',
      progressCount: 1,
      totalCount: 5
    });
  });

  it('answerCorrect emits only safe fields', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.answerCorrect(makeInput());

    expect(result.ok).toBe(true);
    expect(result.event.payload.status).toBe('correct');
    expectOnlyPayloadKeys(result.event, ['itemIndex', 'itemType', 'progressCount', 'totalCount', 'status']);
  });

  it('answerWrong emits only safe fields', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.answerWrong(makeInput());

    expect(result.ok).toBe(true);
    expect(result.event.payload.status).toBe('wrong');
    expectOnlyPayloadKeys(result.event, ['itemIndex', 'itemType', 'progressCount', 'totalCount', 'status']);
  });

  it('reviewDue emits only safe fields', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.reviewDue({
      sessionId: 'session_studyroom_adapter_1',
      dueCountBucket: '1_5',
      totalCount: 5
    });

    expect(result.ok).toBe(true);
    expect(result.event.payload).toEqual({
      totalCount: 5,
      dueCountBucket: '1_5'
    });
  });

  it('sessionComplete emits only safe fields', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.sessionComplete({
      sessionId: 'session_studyroom_adapter_1',
      progressCount: 5,
      totalCount: 5,
      scoreBucket: '80_100',
      accuracyBucket: '80_100'
    });

    expect(result.ok).toBe(true);
    expect(result.event.payload).toEqual({
      progressCount: 5,
      totalCount: 5,
      scoreBucket: '80_100',
      accuracyBucket: '80_100'
    });
  });

  it('sensitive fields are rejected', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });

    const result = adapter.questionPresented(makeInput({
      prompt: 'private prompt',
      sourceMetadata: { sourceName: 'private.pdf' }
    }));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsafe_studyroom_bridge_input');
    expect(adapter.getDebugEvents()).toEqual([]);
  });

  it('does not mutate input', () => {
    const adapter = createStudyRoomBridgeAdapter({ enabled: true, connectMock: true });
    const input = makeInput({ message: { text: 'safe status only' } });
    const before = structuredClone(input);

    adapter.questionPresented(input);

    expect(input).toEqual(before);
  });

  it('source does not depend on storage or network transport APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/studyRoomBridgeAdapter.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i);
  });
});
