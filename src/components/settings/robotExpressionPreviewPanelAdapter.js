import {
  createFakeRobotExpressionRuntime,
  applyRobotExpressionPlan,
  getFakeRobotExpressionSnapshot,
  mapFusionToRobotExpression,
  createRobotCapabilityHandshake
} from '../../shimeIntelligence/index.js';
import { createRobotExpressionDisplayModel } from '../../shimeIntelligence/robotExpressionDisplayModel.js';
import { createFakeRobotConsoleModel } from './fakeRobotConsoleModel.js';
import { createRobotCapabilityPreviewModel } from './robotCapabilityPreviewModel.js';

export function runRobotExpressionPreviewPanel(fusionResult, options = {}) {
  if (!fusionResult || fusionResult.empty || !fusionResult.fusionResult) {
    return {
      empty: true,
      message: 'Chưa có kết quả khớp nối Shime. Hãy chạy khớp nối Shime trước.',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    };
  }
  const expressionPlan = mapFusionToRobotExpression({
    ...fusionResult.fusionResult,
    robotCapabilityProfile: options.robotCapabilityProfile || { supportsDisplay: true, supportsLed: true, motionLocked: true }
  });
  const runtime = createFakeRobotExpressionRuntime({ transcriptLimit: 12 });
  const nextRuntime = applyRobotExpressionPlan(runtime, expressionPlan, { scenarioId: 'section_d_expression_preview' });
  const fakeRobotSnapshot = getFakeRobotExpressionSnapshot(nextRuntime);
  const handshake = createRobotCapabilityHandshake({
    supportsDisplay: true,
    supportsLed: true,
    supportsSound: false,
    supportsPresenceSensor: false,
    supportsWifi: false,
    supportsBle: false,
    supportsSoftAp: false,
    supportsUsbSerial: false,
    supportsMotion: false,
    motionLocked: true
  });
  return {
    empty: false,
    expressionPlan,
    expressionDisplay: createRobotExpressionDisplayModel(expressionPlan),
    fakeRobotConsole: createFakeRobotConsoleModel(fakeRobotSnapshot),
    capabilityPreview: createRobotCapabilityPreviewModel(handshake),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
