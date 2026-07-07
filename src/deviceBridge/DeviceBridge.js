import { createDeviceEvent } from './deviceEventSchema.js';
import { createMockTransport } from './transports/MockTransport.js';

function makeState({ enabled, transport }) {
  const transportState = transport.getState();
  return {
    enabled: enabled === true,
    connected: transportState.connected === true,
    bridgeStatus: enabled === true ? 'enabled' : 'disabled',
    transportStatus: transportState.connected === true ? 'connected' : 'disconnected',
    transportKind: transportState.kind,
    eventCount: transportState.eventCount
  };
}

function safeCallListener(listener, update) {
  try {
    listener(update);
  } catch {
    // Listener failures must never break bridge callers or study flow.
  }
}

export function createDeviceBridge(options = {}) {
  let enabled = options.enabled === true;
  const transport = options.transport || createMockTransport();
  const listeners = new Set();

  function getState() {
    return makeState({ enabled, transport });
  }

  function notify(update) {
    const safeUpdate = {
      ...update,
      state: getState()
    };
    listeners.forEach(listener => safeCallListener(listener, safeUpdate));
    return safeUpdate;
  }

  return {
    getState,

    enable() {
      enabled = true;
      const update = notify({ type: 'bridge_enabled' });
      return { ok: true, state: update.state };
    },

    disable() {
      enabled = false;
      transport.disconnect();
      const update = notify({ type: 'bridge_disabled' });
      return { ok: true, state: update.state };
    },

    connect() {
      if (!enabled) {
        const update = notify({ type: 'bridge_connect_failed', reason: 'bridge_disabled' });
        return { ok: false, reason: 'bridge_disabled', state: update.state };
      }
      const result = transport.connect();
      const update = notify({
        type: result.ok ? 'bridge_connected' : 'bridge_connect_failed',
        reason: result.reason || null
      });
      return { ...result, state: update.state };
    },

    disconnect() {
      const result = transport.disconnect();
      const update = notify({ type: 'bridge_disconnected' });
      return { ...result, state: update.state };
    },

    emit(input) {
      if (!enabled) {
        const update = notify({ type: 'bridge_emit_failed', reason: 'bridge_disabled' });
        return { ok: false, reason: 'bridge_disabled', state: update.state };
      }

      const created = createDeviceEvent(input);
      if (!created.ok) {
        const update = notify({
          type: 'bridge_emit_failed',
          reason: 'invalid_event',
          issues: created.issues
        });
        return { ok: false, reason: 'invalid_event', error: created.error, issues: created.issues, state: update.state };
      }

      const result = transport.send(created.event);
      if (!result.ok) {
        const update = notify({
          type: 'bridge_emit_failed',
          reason: result.reason || 'transport_failed',
          event: created.event
        });
        return { ...result, state: update.state };
      }

      const update = notify({ type: 'bridge_event_sent', event: created.event });
      return { ok: true, event: created.event, state: update.state };
    },

    getDebugEvents() {
      return transport.getEvents();
    },

    clearDebugEvents() {
      const result = transport.clearEvents();
      const update = notify({ type: 'bridge_debug_events_cleared' });
      return { ...result, state: update.state };
    },

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}

