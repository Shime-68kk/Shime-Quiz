import { createTransportResult, TRANSPORT_KINDS, TRANSPORT_STATES } from './TransportContract.js';

function createState(reason = 'transport_unavailable') {
  return {
    kind: TRANSPORT_KINDS.NOOP,
    status: TRANSPORT_STATES.DISABLED,
    connected: false,
    eventCount: 0,
    reason
  };
}

export function createNoopTransport() {
  return {
    connect() {
      return createTransportResult(false, {
        reason: 'transport_unavailable',
        state: createState()
      });
    },

    disconnect() {
      return createTransportResult(true, {
        state: createState('transport_disconnected')
      });
    },

    send() {
      return createTransportResult(false, {
        reason: 'transport_unavailable',
        state: createState()
      });
    },

    getEvents() {
      return [];
    },

    clearEvents() {
      return createTransportResult(true, {
        state: createState('events_already_empty')
      });
    },

    getState() {
      return createState();
    }
  };
}

