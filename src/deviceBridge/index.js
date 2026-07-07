export { createDeviceBridge } from './DeviceBridge.js';
export {
  createDeviceBridgeFacade,
  DEVICE_BRIDGE_TRANSPORT_MODE_MOCK,
  DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN
} from './deviceBridgeFacade.js';
export {
  getSharedDeviceBridgeFacade,
  resetSharedDeviceBridgeFacadeForTests
} from './deviceBridgeRuntime.js';
export { createMockTransport } from './transports/MockTransport.js';
export {
  createDeviceEvent,
  validateDeviceEvent,
  DEVICE_EVENT_SCHEMA_VERSION,
  DEVICE_EVENT_TYPES
} from './deviceEventSchema.js';
export {
  ALLOWED_DEVICE_PAYLOAD_KEYS,
  FORBIDDEN_DEVICE_EVENT_KEYS,
  assertSafeDevicePayload,
  containsForbiddenDevicePayloadData,
  createPrivacySafeFailure,
  sanitizeDevicePayload
} from './redactionPolicy.js';
export {
  createAnswerCorrectEvent,
  createAnswerWrongEvent,
  createBridgeErrorEvent,
  createQuestionPresentedEvent,
  createReviewDueEvent,
  createSessionCompleteEvent,
  createSessionStartedEvent
} from './studyEventFactories.js';
export {
  DEVICE_BRIDGE_PRIVACY_MODE,
  DEVICE_BRIDGE_TRANSPORT_KIND_MOCK,
  DEVICE_BRIDGE_TRANSPORT_STATUSES,
  DEVICE_BRIDGE_UI_STATUSES,
  getDeviceBridgePrivacyWarning,
  getDeviceBridgeStatusLabel
} from './deviceBridgeUiContract.js';
