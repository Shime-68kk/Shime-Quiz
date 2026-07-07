#!/usr/bin/env node
import crypto from 'node:crypto';
import http from 'node:http';

export const DEFAULT_FAKE_SERVER_HOST = '127.0.0.1';
export const DEFAULT_FAKE_SERVER_PORT = 8787;
export const FAKE_SERVER_PROTOCOL_VERSION = 'shime-ws-robot-v0';

export const FORBIDDEN_FAKE_SERVER_KEYS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload'
]);

const INBOUND_MESSAGE_TYPES = Object.freeze({
  HELLO: 'hello',
  ROBOT_EVENT: 'robot_event',
  ROBOT_COMMAND: 'robot_command',
  PING: 'ping',
  DISCONNECT: 'disconnect'
});

const FORBIDDEN_KEY_SET = new Set(FORBIDDEN_FAKE_SERVER_KEYS);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nowIso() {
  return new Date().toISOString();
}

function makeMessageId(prefix = 'fake_server_msg') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function findSensitiveKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findSensitiveKeys(entry, `${path}[${index}]`, found));
    return found;
  }

  if (!value || typeof value !== 'object') return found;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_KEY_SET.has(key)) {
      found.push({ key, path: nextPath });
    }
    findSensitiveKeys(entry, nextPath, found);
  });

  return found;
}

export function parseClientMessage(raw) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(String(raw ?? ''));
    return { ok: true, message: value, error: null };
  } catch {
    return { ok: false, message: null, error: 'invalid_json' };
  }
}

export function classifyClientMessage(message) {
  if (!isPlainObject(message)) return { ok: false, type: 'invalid', reason: 'message_not_object' };
  if (message.protocolVersion !== FAKE_SERVER_PROTOCOL_VERSION) return { ok: false, type: 'invalid', reason: 'invalid_protocol_version' };
  if (typeof message.messageId !== 'string' || !message.messageId.trim()) return { ok: false, type: 'invalid', reason: 'invalid_message_id' };
  if (typeof message.messageType !== 'string' || !message.messageType.trim()) return { ok: false, type: 'invalid', reason: 'invalid_message_type' };
  if (!isPlainObject(message.payload)) return { ok: false, type: message.messageType, reason: 'invalid_payload' };

  if (!Object.values(INBOUND_MESSAGE_TYPES).includes(message.messageType)) {
    return { ok: false, type: message.messageType, reason: 'unsupported_message_type' };
  }

  const sensitiveKeys = findSensitiveKeys(message.payload);
  if (sensitiveKeys.length > 0) {
    return { ok: false, type: message.messageType, reason: 'sensitive_payload_detected', sensitiveKeys };
  }

  return { ok: true, type: message.messageType, reason: null, sensitiveKeys: [] };
}

export function createProtocolMessage(messageType, payload = {}, options = {}) {
  return {
    protocolVersion: FAKE_SERVER_PROTOCOL_VERSION,
    messageId: options.messageId || makeMessageId('fake_server'),
    messageType,
    emittedAt: options.emittedAt || nowIso(),
    source: 'shime-dev-fake-server',
    payload: { ...payload }
  };
}

export function createResponseForMessage(message, options = {}) {
  const classification = classifyClientMessage(message);

  if (!classification.ok) {
    return createProtocolMessage('error', {
      reasonCode: classification.reason,
      message: 'message_rejected'
    }, options);
  }

  if (classification.type === INBOUND_MESSAGE_TYPES.HELLO) {
    return createProtocolMessage('hello_ack', {
      transportStatus: 'connected',
      message: 'fake_server_ready'
    }, options);
  }

  if (classification.type === INBOUND_MESSAGE_TYPES.PING) {
    return createProtocolMessage('pong', {
      transportStatus: 'connected',
      message: 'pong'
    }, options);
  }

  if (classification.type === INBOUND_MESSAGE_TYPES.DISCONNECT) {
    return createProtocolMessage('ack', {
      transportStatus: 'disconnected',
      message: 'disconnect_acknowledged'
    }, options);
  }

  return createProtocolMessage('ack', {
    transportStatus: 'connected',
    message: `${classification.type}_acknowledged`,
    ackFor: message.messageId
  }, options);
}

export function createInvalidJsonResponse(options = {}) {
  return createProtocolMessage('error', {
    reasonCode: 'invalid_json',
    message: 'message_rejected'
  }, options);
}

function createAcceptKey(clientKey) {
  return crypto
    .createHash('sha1')
    .update(`${clientKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');
}

function encodeWebSocketTextFrame(text) {
  const payload = Buffer.from(text);
  const length = payload.length;

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), payload]);
  }

  if (length <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, payload]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, payload]);
}

function decodeWebSocketFrames(buffer) {
  const messages = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const firstByte = buffer[offset];
    const secondByte = buffer[offset + 1];
    const opcode = firstByte & 0x0f;
    const masked = Boolean(secondByte & 0x80);
    let length = secondByte & 0x7f;
    let headerLength = 2;

    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (offset + 10 > buffer.length) break;
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }

    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + length;
    if (offset + frameLength > buffer.length) break;

    const mask = masked ? buffer.subarray(offset + headerLength, offset + headerLength + 4) : null;
    const payloadStart = offset + headerLength + maskLength;
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + length));

    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }

    if (opcode === 0x1) messages.push(payload.toString('utf8'));
    offset += frameLength;
  }

  return { messages, remaining: buffer.subarray(offset) };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = { host: DEFAULT_FAKE_SERVER_HOST, port: DEFAULT_FAKE_SERVER_PORT };
  argv.forEach((entry, index) => {
    if (entry === '--host') args.host = argv[index + 1] || args.host;
    if (entry === '--port') args.port = Number(argv[index + 1]) || args.port;
  });
  return args;
}

export function createFakeWebSocketServer({ host = DEFAULT_FAKE_SERVER_HOST, port = DEFAULT_FAKE_SERVER_PORT, log = console.log } = {}) {
  const server = http.createServer((request, response) => {
    response.writeHead(426, { 'content-type': 'text/plain' });
    response.end('DEV FAKE SERVER: WebSocket upgrade required.\n');
  });

  server.on('upgrade', (request, socket) => {
    const clientKey = request.headers['sec-websocket-key'];
    if (!clientKey) {
      socket.destroy();
      return;
    }

    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${createAcceptKey(clientKey)}`,
      '',
      ''
    ].join('\r\n'));

    log(`[DEV FAKE SERVER] client connected from ${request.socket.remoteAddress}`);

    let buffered = Buffer.alloc(0);
    socket.on('data', chunk => {
      buffered = Buffer.concat([buffered, chunk]);
      const decoded = decodeWebSocketFrames(buffered);
      buffered = decoded.remaining;

      decoded.messages.forEach(rawMessage => {
        const parsed = parseClientMessage(rawMessage);
        if (!parsed.ok) {
          log('[DEV FAKE SERVER] invalid JSON received');
          socket.write(encodeWebSocketTextFrame(JSON.stringify(createInvalidJsonResponse())));
          return;
        }

        const classification = classifyClientMessage(parsed.message);
        log(`[DEV FAKE SERVER] received ${classification.type || 'invalid'}: ${JSON.stringify(parsed.message)}`);
        if (classification.sensitiveKeys?.length) {
          log(`[DEV FAKE SERVER] WARNING sensitive keys detected: ${classification.sensitiveKeys.map(entry => entry.path).join(', ')}`);
        }

        socket.write(encodeWebSocketTextFrame(JSON.stringify(createResponseForMessage(parsed.message))));
      });
    });

    socket.on('error', error => {
      log(`[DEV FAKE SERVER] socket error: ${error.message}`);
    });
  });

  return {
    server,
    host,
    port,
    start() {
      return new Promise(resolve => {
        server.listen(port, host, () => {
          log(`[DEV FAKE SERVER] listening on ws://${host}:${port}`);
          resolve({ host, port });
        });
      });
    },
    stop() {
      return new Promise(resolve => {
        server.close(() => resolve());
      });
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { host, port } = parseArgs();
  const fakeServer = createFakeWebSocketServer({ host, port });
  await fakeServer.start();
}

