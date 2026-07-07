import { createDeviceBridge } from './DeviceBridge.js';
import {
  createAnswerCorrectEvent,
  createAnswerWrongEvent,
  createBridgeErrorEvent,
  createQuestionPresentedEvent,
  createReviewDueEvent,
  createSessionCompleteEvent,
  createSessionStartedEvent
} from './studyEventFactories.js';
import {
  DEVICE_BRIDGE_PRIVACY_MODE,
  DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
  DEVICE_BRIDGE_TRANSPORT_STATUSES,
  DEVICE_BRIDGE_UI_STATUSES
} from './deviceBridgeUiContract.js';
import { createWebSocketTransport } from './transports/WebSocketTransport.js';

export const DEVICE_BRIDGE_TRANSPORT_MODE_MOCK = 'mock';
export const DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN = 'websocket_lan';

const DEVICE_BRIDGE_TRANSPORT_MODES = Object.freeze([
  DEVICE_BRIDGE_TRANSPORT_MODE_MOCK,
  DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN
]);

const STUDY_EVENT_FACTORIES = Object.freeze({
  session_started: createSessionStartedEvent,
  question_presented: createQuestionPresentedEvent,
  answer_correct: createAnswerCorrectEvent,
  answer_wrong: createAnswerWrongEvent,
  review_due: createReviewDueEvent,
  session_complete: createSessionCompleteEvent,
  bridge_error: createBridgeErrorEvent
});

function makeFailure(reason, message) {
  return {
    ok: false,
    reason,
    message
  };
}

function cloneLastError(lastError) {
  if (!lastError) return null;
  return { ...lastError };
}

function normalizeBridgeStatus(state, lastError, wasExplicitlyDisconnected) {
  if (lastError?.reason && state.enabled) return DEVICE_BRIDGE_UI_STATUSES.ERROR;
  if (!state.enabled) return DEVICE_BRIDGE_UI_STATUSES.DISABLED;
  if (state.connected) return DEVICE_BRIDGE_UI_STATUSES.CONNECTED;
  if (state.bridgeStatus === 'disabled') return DEVICE_BRIDGE_UI_STATUSES.DISABLED;
  return wasExplicitlyDisconnected
    ? DEVICE_BRIDGE_UI_STATUSES.DISCONNECTED
    : DEVICE_BRIDGE_UI_STATUSES.ENABLED;
}

function normalizeTransportStatus(state, lastError) {
  if (lastError?.reason && state.enabled) return DEVICE_BRIDGE_TRANSPORT_STATUSES.ERROR;
  if (!state.enabled) return DEVICE_BRIDGE_TRANSPORT_STATUSES.NONE;
  return state.connected
    ? DEVICE_BRIDGE_TRANSPORT_STATUSES.MOCK_CONNECTED
    : DEVICE_BRIDGE_TRANSPORT_STATUSES.MOCK_DISCONNECTED;
}

function normalizeRealTransportStatus(realSnapshot) {
  if (!realSnapshot) return DEVICE_BRIDGE_TRANSPORT_STATUSES.NONE;
  if (realSnapshot.state === 'connected') return 'websocket_connected';
  if (realSnapshot.state === 'connecting') return 'websocket_connecting';
  if (realSnapshot.state === 'error') return DEVICE_BRIDGE_TRANSPORT_STATUSES.ERROR;
  if (realSnapshot.state === 'degraded') return 'websocket_degraded';
  if (realSnapshot.state === 'disconnected') return 'websocket_disconnected';
  return 'websocket_idle';
}

function safeCallListener(listener, update) {
  try {
    listener(update);
  } catch {
    // Listener failures must not affect bridge state or future study flow.
  }
}

export function createDeviceBridgeFacade(options = {}) {
  const bridge = createDeviceBridge({ ...options, enabled: options.enabled === true });
  const listeners = new Set();
  let lastEventType = null;
  let lastError = null;
  let wasExplicitlyDisconnected = false;
  let selectedTransportMode = DEVICE_BRIDGE_TRANSPORT_MODE_MOCK;
  const realTransportFactory = options.realTransportFactory || (() => createWebSocketTransport({
    webSocketFactory: options.webSocketFactory,
    now: options.now,
    idFactory: options.idFactory,
    onStatusChange(update) {
      if (selectedTransportMode !== DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN) return;
      if (update?.snapshot?.lastError?.reason) {
        lastError = {
          reason: update.snapshot.lastError.reason,
          message: 'Real LAN transport status changed.'
        };
      } else if (update?.snapshot?.connected) {
        clearLastError();
      }
      notify('facade_websocket_status_changed', { transportUpdate: update });
    }
  }));
  const realTransport = realTransportFactory();

  function getSnapshot() {
    const state = bridge.getState();
    const realSnapshot = realTransport.getSnapshot();
    const usingRealTransport = selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN;
    return {
      enabled: state.enabled,
      connected: usingRealTransport ? realSnapshot.connected : state.connected,
      bridgeStatus: usingRealTransport
        ? normalizeBridgeStatus({
          enabled: state.enabled,
          connected: realSnapshot.connected,
          bridgeStatus: state.bridgeStatus
        }, lastError || realSnapshot.lastError, wasExplicitlyDisconnected)
        : normalizeBridgeStatus(state, lastError, wasExplicitlyDisconnected),
      transportStatus: usingRealTransport
        ? normalizeRealTransportStatus(realSnapshot)
        : normalizeTransportStatus(state, lastError),
      eventCount: usingRealTransport ? realSnapshot.sentCount : state.eventCount,
      lastEventType,
      lastError: cloneLastError(lastError || realSnapshot.lastError),
      privacyMode: DEVICE_BRIDGE_PRIVACY_MODE,
      transportKind: usingRealTransport ? 'websocket_lan' : DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
      selectedTransportMode,
      realTransportAvailable: true,
      realTransportState: realSnapshot.state,
      realTransportHost: realSnapshot.urlHost || '',
      realTransportRedactedUrl: realSnapshot.redactedUrl || ''
    };
  }

  function notify(type, details = {}) {
    const update = {
      type,
      ...details,
      snapshot: getSnapshot()
    };
    listeners.forEach(listener => safeCallListener(listener, update));
    return update;
  }

  function setLastError(reason, message) {
    lastError = {
      reason,
      message
    };
  }

  function clearLastError() {
    lastError = null;
  }

  return {
    getSnapshot,

    getAvailableTransportModes() {
      return DEVICE_BRIDGE_TRANSPORT_MODES.slice();
    },

    selectTransportMode(mode) {
      if (!DEVICE_BRIDGE_TRANSPORT_MODES.includes(mode)) {
        setLastError('invalid_transport_mode', 'Transport mode is not recognized.');
        notify('facade_transport_mode_failed', { reason: 'invalid_transport_mode' });
        return { ...makeFailure('invalid_transport_mode', 'Transport mode is not recognized.'), snapshot: getSnapshot() };
      }

      if (mode !== selectedTransportMode) {
        selectedTransportMode = mode;
        clearLastError();
        wasExplicitlyDisconnected = false;
        notify('facade_transport_mode_selected', { mode });
      }

      return { ok: true, mode: selectedTransportMode, snapshot: getSnapshot() };
    },

    enable() {
      const result = bridge.enable();
      clearLastError();
      wasExplicitlyDisconnected = false;
      notify('facade_enabled');
      return { ok: true, snapshot: getSnapshot(), state: result.state };
    },

    disable() {
      const result = bridge.disable();
      clearLastError();
      lastEventType = null;
      wasExplicitlyDisconnected = false;
      notify('facade_disabled');
      return { ok: true, snapshot: getSnapshot(), state: result.state };
    },

    connectMock() {
      selectedTransportMode = DEVICE_BRIDGE_TRANSPORT_MODE_MOCK;
      const result = bridge.connect();
      if (!result.ok) {
        setLastError(result.reason || 'bridge_connect_failed', 'Mock bridge connection failed.');
        notify('facade_connect_failed', { reason: result.reason || 'bridge_connect_failed' });
        return { ...makeFailure(result.reason || 'bridge_connect_failed', 'Mock bridge connection failed.'), snapshot: getSnapshot() };
      }

      clearLastError();
      wasExplicitlyDisconnected = false;
      notify('facade_mock_connected');
      return { ok: true, snapshot: getSnapshot(), state: result.state };
    },

    disconnect() {
      const result = bridge.disconnect();
      clearLastError();
      wasExplicitlyDisconnected = true;
      notify('facade_disconnected');
      return { ok: result.ok === true, snapshot: getSnapshot(), state: result.state };
    },

    connectWebSocketTransport({ url } = {}) {
      selectedTransportMode = DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN;
      const state = bridge.getState();
      if (!state.enabled) {
        setLastError('bridge_disabled', 'Enable Device Bridge before connecting real LAN transport.');
        notify('facade_websocket_connect_failed', { reason: 'bridge_disabled' });
        return { ...makeFailure('bridge_disabled', 'Enable Device Bridge before connecting real LAN transport.'), snapshot: getSnapshot() };
      }

      const result = realTransport.connect({ url });
      if (!result.ok) {
        setLastError(result.reason || 'websocket_connect_failed', 'Real LAN transport connection failed.');
        notify('facade_websocket_connect_failed', { reason: result.reason || 'websocket_connect_failed' });
        return { ...makeFailure(result.reason || 'websocket_connect_failed', 'Real LAN transport connection failed.'), snapshot: getSnapshot() };
      }

      clearLastError();
      wasExplicitlyDisconnected = false;
      notify('facade_websocket_connecting');
      return { ok: true, snapshot: getSnapshot() };
    },

    connectRealTransport({ url } = {}) {
      return this.connectWebSocketTransport({ url });
    },

    disconnectTransport() {
      if (selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN) {
        const result = realTransport.disconnect('user_disconnect');
        clearLastError();
        wasExplicitlyDisconnected = true;
        notify('facade_transport_disconnected');
        return { ok: result.ok === true, snapshot: getSnapshot() };
      }

      return this.disconnect();
    },

    emitStudyEvent(factoryName, input) {
      const factory = STUDY_EVENT_FACTORIES[factoryName];
      if (!factory) {
        setLastError('unknown_study_event_factory', 'Unknown study event factory.');
        notify('facade_emit_failed', { reason: 'unknown_study_event_factory' });
        return { ...makeFailure('unknown_study_event_factory', 'Unknown study event factory.'), snapshot: getSnapshot() };
      }

      const created = factory(input);
      if (!created.ok) {
        setLastError(created.reason || 'study_event_factory_failed', created.message || 'Study event factory failed.');
        notify('facade_emit_failed', { reason: created.reason || 'study_event_factory_failed', issues: created.issues || [] });
        return { ...created, snapshot: getSnapshot() };
      }

      if (selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN) {
        const result = realTransport.sendDeviceEvent(created.event);
        if (!result.ok) {
          setLastError(result.reason || 'real_transport_emit_failed', 'Real LAN Device Bridge event emit failed.');
          notify('facade_emit_failed', { reason: result.reason || 'real_transport_emit_failed' });
          return { ...makeFailure(result.reason || 'real_transport_emit_failed', 'Real LAN Device Bridge event emit failed.'), snapshot: getSnapshot() };
        }

        clearLastError();
        lastEventType = created.event.eventType;
        notify('facade_event_sent', { event: created.event });
        return { ok: true, event: created.event, snapshot: getSnapshot() };
      }

      const result = bridge.emit(created.event);
      if (!result.ok) {
        setLastError(result.reason || 'bridge_emit_failed', 'Device Bridge event emit failed.');
        notify('facade_emit_failed', { reason: result.reason || 'bridge_emit_failed' });
        return { ...makeFailure(result.reason || 'bridge_emit_failed', 'Device Bridge event emit failed.'), snapshot: getSnapshot() };
      }

      clearLastError();
      lastEventType = result.event.eventType;
      notify('facade_event_sent', { event: result.event });
      return { ok: true, event: result.event, snapshot: getSnapshot() };
    },

    getDebugEvents() {
      return bridge.getDebugEvents();
    },

    clearDebugEvents() {
      const result = bridge.clearDebugEvents();
      notify('facade_debug_events_cleared');
      return { ...result, snapshot: getSnapshot() };
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
