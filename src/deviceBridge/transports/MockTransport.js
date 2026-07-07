import { validateDeviceEvent } from '../deviceEventSchema.js';

const MOCK_TRANSPORT_KIND = 'mock';

function createState({ enabled = true, connected = false, events = [] } = {}) {
  return {
    kind: MOCK_TRANSPORT_KIND,
    enabled: enabled === true,
    connected: connected === true,
    eventCount: events.length
  };
}

export function createMockTransport(options = {}) {
  let enabled = options.enabled !== false;
  let connected = false;
  let events = [];

  return {
    connect() {
      if (!enabled) {
        return { ok: false, reason: 'transport_disabled', state: createState({ enabled, connected, events }) };
      }
      connected = true;
      return { ok: true, state: createState({ enabled, connected, events }) };
    },

    disconnect() {
      connected = false;
      return { ok: true, state: createState({ enabled, connected, events }) };
    },

    send(event) {
      if (!enabled) {
        return { ok: false, reason: 'transport_disabled', state: createState({ enabled, connected, events }) };
      }
      if (!connected) {
        return { ok: false, reason: 'transport_disconnected', state: createState({ enabled, connected, events }) };
      }

      const validation = validateDeviceEvent(event);
      if (!validation.ok) {
        return {
          ok: false,
          reason: 'invalid_event',
          validation,
          state: createState({ enabled, connected, events })
        };
      }

      events = [...events, event];
      return { ok: true, event, state: createState({ enabled, connected, events }) };
    },

    getEvents() {
      return events.slice();
    },

    clearEvents() {
      events = [];
      return { ok: true, state: createState({ enabled, connected, events }) };
    },

    getState() {
      return createState({ enabled, connected, events });
    }
  };
}

