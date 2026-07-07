import {
  createTransportEnvelope,
  createTransportResult,
  TRANSPORT_KINDS,
  TRANSPORT_STATES
} from './TransportContract.js';

function createState({ connected = false, envelopes = [] } = {}) {
  return {
    kind: TRANSPORT_KINDS.LOOPBACK,
    status: connected ? TRANSPORT_STATES.CONNECTED : TRANSPORT_STATES.DISCONNECTED,
    connected: connected === true,
    eventCount: envelopes.length
  };
}

export function createLoopbackTransport(options = {}) {
  let connected = options.connected === true;
  let envelopes = [];

  return {
    connect() {
      connected = true;
      return createTransportResult(true, {
        state: createState({ connected, envelopes })
      });
    },

    disconnect() {
      connected = false;
      return createTransportResult(true, {
        state: createState({ connected, envelopes })
      });
    },

    send(event) {
      if (!connected) {
        return createTransportResult(false, {
          reason: 'transport_disconnected',
          state: createState({ connected, envelopes })
        });
      }

      const created = createTransportEnvelope(event);
      if (!created.ok) {
        return createTransportResult(false, {
          reason: 'invalid_event',
          validation: created,
          state: createState({ connected, envelopes })
        });
      }

      envelopes = [...envelopes, created.envelope];
      return createTransportResult(true, {
        envelope: created.envelope,
        state: createState({ connected, envelopes })
      });
    },

    getEvents() {
      return envelopes.slice();
    },

    getEnvelopes() {
      return envelopes.slice();
    },

    clearEvents() {
      envelopes = [];
      return createTransportResult(true, {
        state: createState({ connected, envelopes })
      });
    },

    getState() {
      return createState({ connected, envelopes });
    }
  };
}

