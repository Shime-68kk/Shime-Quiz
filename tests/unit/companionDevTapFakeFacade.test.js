import { describe, expect, it } from 'vitest';
import { createFakeCompanionFacade } from '../../tools/deviceBridge/fakeCompanionFacade.mjs';

describe('fakeCompanionFacade', () => {
  it('subscribe, event delivery, and unsubscribe work', () => {
    const facade = createFakeCompanionFacade();
    const updates = [];
    const unsubscribe = facade.subscribe(update => updates.push(update));

    facade.emitFakeDeviceBridgeEvent({ eventType: 'session_started', payload: {} });
    expect(updates).toHaveLength(1);
    expect(facade.getSnapshot().listenerCount).toBe(1);
    unsubscribe();
    facade.emitFakeDeviceBridgeEvent({ eventType: 'question_presented', payload: {} });
    expect(updates).toHaveLength(1);
    expect(facade.getSnapshot().listenerCount).toBe(0);
  });

  it('listener errors are isolated', () => {
    const facade = createFakeCompanionFacade();
    facade.subscribe(() => {
      throw new Error('listener failed');
    });

    expect(() => facade.emitFakeDeviceBridgeEvent({ eventType: 'session_started', payload: {} })).not.toThrow();
    expect(facade.getSnapshot().lastError).toMatchObject({ reason: 'listener_failed' });
  });

  it('has no real external send behavior', () => {
    const facade = createFakeCompanionFacade();

    expect(facade.sendRobotCommand()).toMatchObject({ ok: false, reason: 'external_send_forbidden' });
    expect(facade.getSnapshot().sentExternally).toBe(1);
  });
});
