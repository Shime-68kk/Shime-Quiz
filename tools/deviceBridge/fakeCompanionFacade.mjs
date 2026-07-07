export function createFakeCompanionFacade(options = {}) {
  const listeners = new Set();
  const emittedUpdates = [];
  let sentExternally = 0;
  let lastError = null;

  function notify(update) {
    emittedUpdates.push(update);
    listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        lastError = { reason: 'listener_failed', message: error?.message || 'listener failed' };
      }
    });
    return update;
  }

  return {
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    emitFakeDeviceBridgeEvent(event) {
      return notify({
        type: 'facade_event_sent',
        event,
        snapshot: this.getSnapshot()
      });
    },

    emitFakeError(error = {}) {
      lastError = {
        reason: error.reason || 'fake_facade_error',
        message: error.message || 'Fake facade error.'
      };
      return notify({
        type: 'facade_emit_failed',
        reason: lastError.reason,
        snapshot: this.getSnapshot()
      });
    },

    sendRobotCommand() {
      sentExternally += 1;
      return { ok: false, reason: 'external_send_forbidden' };
    },

    getSnapshot() {
      return {
        label: options.label || 'fake_companion_facade',
        listenerCount: listeners.size,
        emittedUpdateCount: emittedUpdates.length,
        sentExternally,
        lastError
      };
    },

    getEmittedUpdates() {
      return emittedUpdates.slice();
    }
  };
}
