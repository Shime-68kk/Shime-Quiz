import { describe, expect, it } from 'vitest';
import {
  disableSharedCompanionLiveDevTap,
  enableSharedCompanionLiveDevTap,
  getSharedCompanionLiveDevTapSnapshot,
  resetSharedCompanionLiveDevTapForTests,
  subscribeSharedCompanionLiveDevTap,
  createCompanionDevTapRuntime
} from '../../src/companion/companionDevTapRuntime.js';

function createFakeFacade() {
  const listeners = new Set();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(update) {
      listeners.forEach(listener => listener(update));
    },
    listenerCount() {
      return listeners.size;
    }
  };
}

describe('companionDevTapRuntime', () => {
  it('does not subscribe on construction and subscribes only on enable', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    expect(facade.listenerCount()).toBe(0);
    expect(runtime.getSnapshot().runtimeEnabled).toBe(false);
    runtime.enable();
    expect(facade.listenerCount()).toBe(1);
    expect(runtime.getSnapshot().subscribed).toBe(true);
  });

  it('disable unsubscribes cleanly', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    runtime.disable();
    expect(facade.listenerCount()).toBe(0);
    expect(runtime.getSnapshot().subscribed).toBe(false);
  });

  it('fake facade event updates tap snapshot', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });
    runtime.enable();
    facade.emit({
      type: 'facade_event_sent',
      event: {
        eventType: 'session_started',
        sessionId: 'runtime_session',
        payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
      }
    });

    expect(runtime.getSnapshot()).toMatchObject({ observedEventCount: 1, acceptedEventCount: 1 });
    expect(runtime.getTranscript()).toHaveLength(1);
  });

  it('notifies update callback after observed events and transcript clear', () => {
    const facade = createFakeFacade();
    const updates = [];
    const runtime = createCompanionDevTapRuntime({
      facade,
      onRuntimeUpdate(update) {
        updates.push(update);
      }
    });

    runtime.enable();
    facade.emit({
      type: 'facade_event_sent',
      event: {
        eventType: 'session_started',
        sessionId: 'runtime_session',
        payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
      }
    });
    runtime.clearTranscript();

    expect(updates.map(update => update.reason)).toEqual(['event_observed', 'transcript_cleared']);
    expect(updates[0].snapshot.observedEventCount).toBe(1);
    expect(updates[0].transcript).toHaveLength(1);
    expect(updates[1].transcript).toHaveLength(0);
  });

  it('ignores non-event updates and does not crash without facade', () => {
    const runtime = createCompanionDevTapRuntime();

    expect(runtime.enable().runtimeEnabled).toBe(true);
    expect(runtime.getSnapshot().subscribed).toBe(false);
  });

  it('shared live dev tap survives UI listener unsubscribe until explicit disable', () => {
    resetSharedCompanionLiveDevTapForTests();
    const facade = createFakeFacade();
    const updates = [];
    const unsubscribeUi = subscribeSharedCompanionLiveDevTap(update => updates.push(update));

    const runtime = enableSharedCompanionLiveDevTap({ facade });
    expect(runtime.getSnapshot()).toMatchObject({ runtimeEnabled: true, subscribed: true });
    expect(facade.listenerCount()).toBe(1);

    unsubscribeUi();
    facade.emit({
      type: 'facade_event_sent',
      event: {
        eventType: 'session_started',
        sessionId: 'route_session',
        payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
      }
    });

    const current = getSharedCompanionLiveDevTapSnapshot();
    expect(current.snapshot).toMatchObject({ runtimeEnabled: true, observedEventCount: 1 });
    expect(current.transcript).toHaveLength(1);

    disableSharedCompanionLiveDevTap();
    expect(facade.listenerCount()).toBe(0);
    resetSharedCompanionLiveDevTapForTests();
  });

  it('shared live dev tap reset simulates full page reload', () => {
    resetSharedCompanionLiveDevTapForTests();
    const facade = createFakeFacade();
    enableSharedCompanionLiveDevTap({ facade });
    resetSharedCompanionLiveDevTapForTests();

    expect(getSharedCompanionLiveDevTapSnapshot()).toEqual({ snapshot: null, transcript: [] });
  });
});
