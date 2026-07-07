import { createCompanionDevTap } from './companionDevTap.js';

export function createCompanionDevTapRuntime(options = {}) {
  const facade = options.facade;
  const tap = options.tap || createCompanionDevTap(options);
  let unsubscribe = null;
  let enabled = false;
  let lastError = null;

  function notifyRuntimeUpdate(reason) {
    if (typeof options.onRuntimeUpdate !== 'function') return;
    try {
      options.onRuntimeUpdate({
        reason,
        snapshot: this.getSnapshot(),
        transcript: this.getTranscript()
      });
    } catch {
      lastError = { reason: 'companion_dev_tap_runtime_listener_failed' };
    }
  }

  function handleUpdate(update) {
    if (!enabled || !update || update.type !== 'facade_event_sent' || !update.event) return;
    try {
      tap.observeDeviceBridgeEvent(update.event);
      notifyRuntimeUpdate.call(this, 'event_observed');
    } catch {
      lastError = { reason: 'companion_dev_tap_runtime_observe_failed' };
    }
  }

  return {
    enable() {
      tap.enable();
      enabled = true;
      lastError = null;
      if (facade && typeof facade.subscribe === 'function' && !unsubscribe) {
        unsubscribe = facade.subscribe(handleUpdate.bind(this));
      }
      return this.getSnapshot();
    },

    disable() {
      enabled = false;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      tap.disable();
      return this.getSnapshot();
    },

    getSnapshot() {
      return {
        ...tap.getSnapshot(),
        runtimeEnabled: enabled,
        subscribed: typeof unsubscribe === 'function',
        lastRuntimeError: lastError
      };
    },

    getTranscript() {
      return tap.getTranscript();
    },

    clearTranscript() {
      const snapshot = tap.clearTranscript();
      notifyRuntimeUpdate.call(this, 'transcript_cleared');
      return snapshot;
    }
  };
}

let sharedLiveDevTapRuntime = null;
const sharedLiveDevTapListeners = new Set();

function notifySharedLiveDevTapListeners(reason) {
  if (!sharedLiveDevTapRuntime) return;
  const update = {
    reason,
    snapshot: sharedLiveDevTapRuntime.getSnapshot(),
    transcript: sharedLiveDevTapRuntime.getTranscript()
  };
  sharedLiveDevTapListeners.forEach(listener => {
    try {
      listener(update);
    } catch {
      // Dev UI listeners must not affect live observation.
    }
  });
}

export function getSharedCompanionLiveDevTapRuntime(options = {}) {
  if (!sharedLiveDevTapRuntime) {
    sharedLiveDevTapRuntime = createCompanionDevTapRuntime({
      ...options,
      onRuntimeUpdate(update) {
        if (typeof options.onRuntimeUpdate === 'function') options.onRuntimeUpdate(update);
        notifySharedLiveDevTapListeners(update.reason || 'runtime_update');
      }
    });
  }
  return sharedLiveDevTapRuntime;
}

export function subscribeSharedCompanionLiveDevTap(listener) {
  if (typeof listener !== 'function') return () => {};
  sharedLiveDevTapListeners.add(listener);
  if (sharedLiveDevTapRuntime) {
    listener({
      reason: 'initial_snapshot',
      snapshot: sharedLiveDevTapRuntime.getSnapshot(),
      transcript: sharedLiveDevTapRuntime.getTranscript()
    });
  }
  return () => {
    sharedLiveDevTapListeners.delete(listener);
  };
}

export function enableSharedCompanionLiveDevTap(options = {}) {
  const runtime = getSharedCompanionLiveDevTapRuntime(options);
  runtime.enable();
  notifySharedLiveDevTapListeners('enabled');
  return runtime;
}

export function disableSharedCompanionLiveDevTap() {
  if (!sharedLiveDevTapRuntime) return null;
  sharedLiveDevTapRuntime.disable();
  notifySharedLiveDevTapListeners('disabled');
  return sharedLiveDevTapRuntime;
}

export function clearSharedCompanionLiveDevTapTranscript() {
  if (!sharedLiveDevTapRuntime) return null;
  sharedLiveDevTapRuntime.clearTranscript();
  notifySharedLiveDevTapListeners('transcript_cleared');
  return sharedLiveDevTapRuntime;
}

export function getSharedCompanionLiveDevTapSnapshot() {
  if (!sharedLiveDevTapRuntime) {
    return {
      snapshot: null,
      transcript: []
    };
  }
  return {
    snapshot: sharedLiveDevTapRuntime.getSnapshot(),
    transcript: sharedLiveDevTapRuntime.getTranscript()
  };
}

export function resetSharedCompanionLiveDevTapForTests() {
  if (sharedLiveDevTapRuntime) sharedLiveDevTapRuntime.disable();
  sharedLiveDevTapRuntime = null;
  sharedLiveDevTapListeners.clear();
}
