import { validateDeviceEvent } from '../deviceEventSchema.js';
import { assertSafeDevicePayload } from '../redactionPolicy.js';
import {
  ROBOT_COMMAND_NAMES,
  validateRobotCommandName
} from './TransportContract.js';

export const WEB_SOCKET_TRANSPORT_KIND = 'websocket_lan';
export const WEB_SOCKET_PROTOCOL_VERSION = 'shime-ws-robot-v0';
export const WEB_SOCKET_SOURCE = 'shime-quiz';

export const WEB_SOCKET_CONNECTION_STATES = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
});

export const WEB_SOCKET_APP_MESSAGE_TYPES = Object.freeze({
  HELLO: 'hello',
  ROBOT_EVENT: 'robot_event',
  ROBOT_COMMAND: 'robot_command',
  PING: 'ping',
  DISCONNECT: 'disconnect'
});

export const WEB_SOCKET_INBOUND_MESSAGE_TYPES = Object.freeze({
  HELLO_ACK: 'hello_ack',
  ACK: 'ack',
  STATUS: 'status',
  ERROR: 'error',
  PONG: 'pong'
});

const INBOUND_TYPE_VALUES = new Set(Object.values(WEB_SOCKET_INBOUND_MESSAGE_TYPES));
const PRIVATE_HOST_RANGES = Object.freeze([
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function createResult(ok, fields = {}) {
  return {
    ok: ok === true,
    ...fields
  };
}

function defaultNow() {
  return new Date().toISOString();
}

function defaultIdFactory(prefix = 'ws_msg') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeParseJson(rawMessage) {
  try {
    return { ok: true, value: typeof rawMessage === 'string' ? JSON.parse(rawMessage) : JSON.parse(String(rawMessage?.data ?? '')) };
  } catch {
    return { ok: false, value: null };
  }
}

function isValidIsoTimestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return false;
  return new Date(time).toISOString() === value;
}

function isPrivateIpv4(hostname) {
  if (hostname === '127.0.0.1') return true;
  if (PRIVATE_HOST_RANGES.some(pattern => pattern.test(hostname))) return true;
  const match = hostname.match(/^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/);
  if (!match) return false;
  const second = Number(match[1]);
  return second >= 16 && second <= 31;
}

export function validateWebSocketUrl(inputUrl) {
  if (typeof inputUrl !== 'string' || !inputUrl.trim()) {
    return createResult(false, { reason: 'invalid_url', url: null, redactedUrl: '' });
  }

  let parsed;
  try {
    parsed = new URL(inputUrl);
  } catch {
    return createResult(false, { reason: 'invalid_url', url: null, redactedUrl: '' });
  }

  if (parsed.protocol !== 'ws:') {
    return createResult(false, { reason: 'unsupported_protocol', url: null, redactedUrl: '' });
  }

  if (parsed.username || parsed.password) {
    return createResult(false, { reason: 'credentials_not_allowed', url: null, redactedUrl: '' });
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPrivateHost = isPrivateIpv4(hostname);
  const isLocalName = hostname.endsWith('.local');

  if (!isLocalHost && !isPrivateHost && !isLocalName) {
    return createResult(false, {
      reason: 'non_local_url_rejected',
      url: null,
      redactedUrl: `${parsed.protocol}//${parsed.host}`
    });
  }

  return createResult(true, {
    url: parsed.toString(),
    urlHost: parsed.host,
    redactedUrl: `${parsed.protocol}//${parsed.host}`
  });
}

function createEnvelope(messageType, payload, options = {}) {
  const emittedAt = options.emittedAt || options.now?.() || defaultNow();
  if (!isValidIsoTimestamp(emittedAt)) {
    return createResult(false, {
      reason: 'invalid_emitted_at',
      envelope: null,
      issues: [makeIssue('invalid_emitted_at', 'emittedAt must be a valid ISO timestamp.', '$.emittedAt')]
    });
  }

  return createResult(true, {
    envelope: {
      protocolVersion: WEB_SOCKET_PROTOCOL_VERSION,
      messageId: options.messageId || options.idFactory?.('ws_msg') || defaultIdFactory('ws_msg'),
      messageType,
      emittedAt,
      source: WEB_SOCKET_SOURCE,
      payload: { ...payload }
    }
  });
}

export function createWebSocketRobotEventEnvelope(event, options = {}) {
  const validation = validateDeviceEvent(event);
  if (!validation.ok) {
    return createResult(false, {
      reason: 'invalid_device_event',
      envelope: null,
      validation
    });
  }

  return createEnvelope(WEB_SOCKET_APP_MESSAGE_TYPES.ROBOT_EVENT, {
    eventType: event.eventType,
    sessionId: event.sessionId,
    ...event.payload
  }, options);
}

export function createWebSocketRobotCommandEnvelope(command, payload = {}, options = {}) {
  const commandValidation = validateRobotCommandName(command);
  if (!commandValidation.ok) {
    return createResult(false, {
      reason: 'invalid_robot_command',
      envelope: null,
      validation: commandValidation
    });
  }

  if (!isPlainObject(payload)) {
    return createResult(false, {
      reason: 'invalid_robot_command_payload',
      envelope: null,
      issues: [makeIssue('invalid_robot_command_payload', 'Robot command payload must be a plain object.', '$.payload')]
    });
  }

  const sanitized = assertSafeDevicePayload({ command, ...payload });
  if (!sanitized.ok) {
    return createResult(false, {
      reason: 'unsafe_robot_command_payload',
      envelope: null,
      issues: sanitized.issues
    });
  }

  return createEnvelope(WEB_SOCKET_APP_MESSAGE_TYPES.ROBOT_COMMAND, sanitized.payload, options);
}

export function validateInboundWebSocketMessage(message) {
  const issues = [];

  if (!isPlainObject(message)) {
    return createResult(false, {
      reason: 'message_not_object',
      issues: [makeIssue('message_not_object', 'Inbound message must be a plain object.')]
    });
  }

  if (message.protocolVersion !== WEB_SOCKET_PROTOCOL_VERSION) {
    issues.push(makeIssue('invalid_protocol_version', `protocolVersion must be ${WEB_SOCKET_PROTOCOL_VERSION}.`, '$.protocolVersion'));
  }

  if (typeof message.messageId !== 'string' || !message.messageId.trim()) {
    issues.push(makeIssue('invalid_message_id', 'messageId must be a non-empty string.', '$.messageId'));
  }

  if (!INBOUND_TYPE_VALUES.has(message.messageType)) {
    issues.push(makeIssue('invalid_message_type', 'Inbound message type is not recognized.', '$.messageType'));
  }

  if (!isValidIsoTimestamp(message.emittedAt)) {
    issues.push(makeIssue('invalid_emitted_at', 'emittedAt must be a valid ISO timestamp.', '$.emittedAt'));
  }

  if (typeof message.source !== 'string' || !message.source.trim()) {
    issues.push(makeIssue('invalid_source', 'source must be a non-empty string.', '$.source'));
  }

  if (!isPlainObject(message.payload)) {
    issues.push(makeIssue('invalid_payload', 'payload must be a plain object.', '$.payload'));
  } else {
    const payloadValidation = assertSafeDevicePayload(message.payload);
    if (!payloadValidation.ok) issues.push(...payloadValidation.issues);
  }

  return createResult(issues.length === 0, {
    reason: issues.length ? 'invalid_inbound_message' : null,
    issues
  });
}

function createSnapshot(state) {
  return {
    kind: WEB_SOCKET_TRANSPORT_KIND,
    state: state.connectionState,
    connected: state.connectionState === WEB_SOCKET_CONNECTION_STATES.CONNECTED,
    urlHost: state.urlHost,
    redactedUrl: state.redactedUrl,
    lastError: state.lastError,
    lastAckMessageId: state.lastAckMessageId,
    sentCount: state.sentCount,
    receivedCount: state.receivedCount,
    droppedCount: state.droppedCount,
    privacyMode: 'redacted'
  };
}

function createInitialState() {
  return {
    connectionState: WEB_SOCKET_CONNECTION_STATES.IDLE,
    url: '',
    urlHost: '',
    redactedUrl: '',
    lastError: null,
    lastAckMessageId: '',
    sentCount: 0,
    receivedCount: 0,
    droppedCount: 0,
    sendWindowStartedAt: 0,
    sendCountInWindow: 0
  };
}

export function createWebSocketTransport(options = {}) {
  const now = options.now || defaultNow;
  const idFactory = options.idFactory || defaultIdFactory;
  const onStatusChange = typeof options.onStatusChange === 'function' ? options.onStatusChange : null;
  const maxMessagesPerWindow = Number.isFinite(options.maxMessagesPerWindow) ? options.maxMessagesPerWindow : 20;
  const rateWindowMs = Number.isFinite(options.rateWindowMs) ? options.rateWindowMs : 1000;
  let state = createInitialState();
  let socket = null;

  function notifyStatusChange(type, details = {}) {
    if (!onStatusChange) return;
    try {
      onStatusChange({
        type,
        ...details,
        snapshot: createSnapshot(state)
      });
    } catch {
      // Transport status listeners must not affect socket handling.
    }
  }

  function setError(reason) {
    state = {
      ...state,
      connectionState: WEB_SOCKET_CONNECTION_STATES.ERROR,
      lastError: { reason }
    };
    notifyStatusChange('websocket_error', { reason });
  }

  function checkRateLimit() {
    const currentTime = Date.parse(now());
    const safeTime = Number.isFinite(currentTime) ? currentTime : 0;
    if (!state.sendWindowStartedAt || safeTime - state.sendWindowStartedAt >= rateWindowMs) {
      state = { ...state, sendWindowStartedAt: safeTime, sendCountInWindow: 0 };
    }

    if (state.sendCountInWindow >= maxMessagesPerWindow) {
      state = { ...state, droppedCount: state.droppedCount + 1, lastError: { reason: 'rate_limited' } };
      notifyStatusChange('websocket_rate_limited', { reason: 'rate_limited' });
      return false;
    }

    state = { ...state, sendCountInWindow: state.sendCountInWindow + 1 };
    return true;
  }

  function sendEnvelope(envelope) {
    if (!socket || state.connectionState === WEB_SOCKET_CONNECTION_STATES.IDLE || state.connectionState === WEB_SOCKET_CONNECTION_STATES.DISCONNECTED) {
      return createResult(false, { reason: 'transport_disconnected', snapshot: createSnapshot(state) });
    }

    if (!checkRateLimit()) {
      return createResult(false, { reason: 'rate_limited', snapshot: createSnapshot(state) });
    }

    try {
      socket.send(JSON.stringify(envelope));
      state = { ...state, sentCount: state.sentCount + 1 };
      notifyStatusChange('websocket_message_sent', { messageType: envelope.messageType, messageId: envelope.messageId });
      return createResult(true, { messageId: envelope.messageId, snapshot: createSnapshot(state) });
    } catch {
      setError('send_failed');
      return createResult(false, { reason: 'send_failed', snapshot: createSnapshot(state) });
    }
  }

  function sendHello() {
    const created = createEnvelope(WEB_SOCKET_APP_MESSAGE_TYPES.HELLO, {
      bridgeStatus: 'enabled',
      transportStatus: 'connecting'
    }, { now, idFactory });

    if (!created.ok) return created;
    return sendEnvelope(created.envelope);
  }

  function handleIncomingMessage(rawMessage) {
    const parsed = safeParseJson(rawMessage);
    if (!parsed.ok) {
      state = { ...state, droppedCount: state.droppedCount + 1 };
      notifyStatusChange('websocket_message_dropped', { reason: 'malformed_message' });
      return createResult(false, { reason: 'malformed_message', snapshot: createSnapshot(state) });
    }

    const validation = validateInboundWebSocketMessage(parsed.value);
    if (!validation.ok) {
      state = { ...state, droppedCount: state.droppedCount + 1 };
      notifyStatusChange('websocket_message_dropped', { reason: validation.reason });
      return createResult(false, { reason: validation.reason, validation, snapshot: createSnapshot(state) });
    }

    state = { ...state, receivedCount: state.receivedCount + 1 };

    if (parsed.value.messageType === WEB_SOCKET_INBOUND_MESSAGE_TYPES.HELLO_ACK) {
      state = {
        ...state,
        connectionState: WEB_SOCKET_CONNECTION_STATES.CONNECTED,
        lastAckMessageId: parsed.value.messageId,
        lastError: null
      };
    } else if (parsed.value.messageType === WEB_SOCKET_INBOUND_MESSAGE_TYPES.ACK) {
      state = { ...state, lastAckMessageId: parsed.value.messageId };
    } else if (parsed.value.messageType === WEB_SOCKET_INBOUND_MESSAGE_TYPES.ERROR) {
      state = {
        ...state,
        connectionState: WEB_SOCKET_CONNECTION_STATES.DEGRADED,
        lastError: { reason: parsed.value.payload.reasonCode || 'remote_error' }
      };
    } else if (parsed.value.messageType === WEB_SOCKET_INBOUND_MESSAGE_TYPES.STATUS) {
      state = {
        ...state,
        lastError: parsed.value.payload.transportStatus === 'degraded' ? { reason: 'remote_degraded' } : state.lastError
      };
    }

    notifyStatusChange('websocket_message_received', { messageType: parsed.value.messageType, messageId: parsed.value.messageId });
    return createResult(true, { message: parsed.value, snapshot: createSnapshot(state) });
  }

  function attachSocketHandlers(nextSocket) {
    nextSocket.onopen = () => {
      state = { ...state, connectionState: WEB_SOCKET_CONNECTION_STATES.CONNECTING, lastError: null };
      notifyStatusChange('websocket_open');
      sendHello();
    };
    nextSocket.onmessage = event => {
      handleIncomingMessage(event);
    };
    nextSocket.onerror = () => {
      setError('socket_error');
    };
    nextSocket.onclose = () => {
      state = {
        ...state,
        connectionState: WEB_SOCKET_CONNECTION_STATES.DISCONNECTED,
        lastError: state.lastError
      };
      notifyStatusChange('websocket_closed');
    };
  }

  return {
    kind: WEB_SOCKET_TRANSPORT_KIND,

    getSnapshot() {
      return createSnapshot(state);
    },

    connect(connectOptions = {}) {
      if (
        socket &&
        (state.connectionState === WEB_SOCKET_CONNECTION_STATES.CONNECTING ||
          state.connectionState === WEB_SOCKET_CONNECTION_STATES.CONNECTED)
      ) {
        return createResult(true, { snapshot: createSnapshot(state), reason: 'already_connected' });
      }

      const targetUrl = connectOptions.url || options.url;
      const validation = validateWebSocketUrl(targetUrl);
      if (!validation.ok) {
      state = {
        ...state,
        connectionState: WEB_SOCKET_CONNECTION_STATES.ERROR,
          lastError: { reason: validation.reason },
          url: '',
          urlHost: '',
          redactedUrl: validation.redactedUrl || ''
        };
        notifyStatusChange('websocket_connect_failed', { reason: validation.reason });
        return createResult(false, { reason: validation.reason, snapshot: createSnapshot(state) });
      }

      const Factory = connectOptions.webSocketFactory || options.webSocketFactory || globalThis.WebSocket;
      if (typeof Factory !== 'function') {
        setError('websocket_unavailable');
        return createResult(false, { reason: 'websocket_unavailable', snapshot: createSnapshot(state) });
      }

      state = {
        ...state,
        connectionState: WEB_SOCKET_CONNECTION_STATES.CONNECTING,
        lastError: null,
        url: validation.url,
        urlHost: validation.urlHost,
        redactedUrl: validation.redactedUrl
      };
      notifyStatusChange('websocket_connecting');

      try {
        socket = new Factory(validation.url);
        attachSocketHandlers(socket);
        return createResult(true, { snapshot: createSnapshot(state) });
      } catch {
        setError('connect_failed');
        return createResult(false, { reason: 'connect_failed', snapshot: createSnapshot(state) });
      }
    },

    disconnect(reason = 'user_disconnect') {
      const disconnectEnvelope = createEnvelope(WEB_SOCKET_APP_MESSAGE_TYPES.DISCONNECT, {
        reasonCode: reason,
        transportStatus: 'disconnected'
      }, { now, idFactory });
      if (socket && disconnectEnvelope.ok) sendEnvelope(disconnectEnvelope.envelope);

      if (socket && typeof socket.close === 'function') {
        try {
          socket.close();
        } catch {
          // Closing is best effort; the local state below is still safe.
        }
      }
      socket = null;
      state = { ...state, connectionState: WEB_SOCKET_CONNECTION_STATES.DISCONNECTED };
      notifyStatusChange('websocket_disconnected', { reason });
      return createResult(true, { snapshot: createSnapshot(state) });
    },

    sendDeviceEvent(event) {
      if (state.connectionState !== WEB_SOCKET_CONNECTION_STATES.CONNECTED) {
        return createResult(false, { reason: 'transport_not_connected', snapshot: createSnapshot(state) });
      }

      const created = createWebSocketRobotEventEnvelope(event, { now, idFactory });
      if (!created.ok) {
        state = { ...state, droppedCount: state.droppedCount + 1, lastError: { reason: created.reason } };
        notifyStatusChange('websocket_message_dropped', { reason: created.reason });
        return createResult(false, { reason: created.reason, validation: created.validation, snapshot: createSnapshot(state) });
      }

      return sendEnvelope(created.envelope);
    },

    sendRobotCommand(command = ROBOT_COMMAND_NAMES.NEUTRAL, payload = {}) {
      if (state.connectionState !== WEB_SOCKET_CONNECTION_STATES.CONNECTED) {
        return createResult(false, { reason: 'transport_not_connected', snapshot: createSnapshot(state) });
      }

      const created = createWebSocketRobotCommandEnvelope(command, payload, { now, idFactory });
      if (!created.ok) {
        state = { ...state, droppedCount: state.droppedCount + 1, lastError: { reason: created.reason } };
        notifyStatusChange('websocket_message_dropped', { reason: created.reason });
        return createResult(false, { reason: created.reason, snapshot: createSnapshot(state) });
      }

      return sendEnvelope(created.envelope);
    },

    handleIncomingMessage
  };
}
