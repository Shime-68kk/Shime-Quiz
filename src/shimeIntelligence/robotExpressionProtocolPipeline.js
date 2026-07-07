import { runShimeEcosystemFusion, summarizeShimeEcosystemFusion } from './appRobotFusionEngine.js';
import { mapFusionToRobotExpression } from './robotExpressionMapper.js';
import {
  createRobotExpressionEnvelope,
  summarizeRobotExpressionEnvelope,
  validateRobotExpressionEnvelope
} from './robotExpressionEnvelopeProtocol.js';
import {
  appendExpressionEnvelopeToTranscript,
  createFakeExpressionTransportTranscript,
  summarizeFakeExpressionTransportTranscript
} from './fakeExpressionTransportTranscript.js';
import {
  createEsp32ExpressionLogPreview,
  summarizeEsp32ExpressionLogPreview,
  validateEsp32ExpressionLogPreview
} from './esp32ExpressionLogContract.js';

function resolveFusionResult(input = {}, options = {}) {
  if (input.fusionResult) return input.fusionResult;
  if (input.learningCapsule && input.robotInterventionPlan) return input;
  return runShimeEcosystemFusion(input, options);
}

export function runRobotExpressionProtocolPipeline(input = {}, options = {}) {
  const fusionResult = resolveFusionResult(input, options);
  const expressionPlan = mapFusionToRobotExpression({
    ...fusionResult,
    robotCapabilityProfile: input.robotProfile || input.robotCapabilityProfile,
    safetyMode: input.safetyMode,
    transportHealth: input.transportHealth,
    robotAvailability: input.robotAvailability
  });
  const expressionEnvelope = createRobotExpressionEnvelope(expressionPlan, {
    envelopeId: options.envelopeId || `expr_pipeline_${options.scenarioId || 'default'}`
  });
  const envelopeValidation = validateRobotExpressionEnvelope(expressionEnvelope);
  const fakeTransportTranscript = appendExpressionEnvelopeToTranscript(
    createFakeExpressionTransportTranscript({ maxRows: options.maxRows || 12 }),
    expressionEnvelope
  );
  const esp32LogPreview = createEsp32ExpressionLogPreview(expressionEnvelope);
  const esp32Validation = validateEsp32ExpressionLogPreview(esp32LogPreview);
  const safetyResult = {
    ok: envelopeValidation.ok && esp32Validation.ok && expressionEnvelope.motionPolicy === 'locked',
    failures: [...envelopeValidation.failures, ...esp32Validation.failures],
    reasonCodes: ['robot_expression_protocol_safety_checked']
  };
  const privacyResult = {
    ok: expressionEnvelope.privacyStatus !== 'blocked' || expressionPlan.privacyStatus === 'blocked',
    privacyStatus: expressionEnvelope.privacyStatus,
    reasonCodes: ['robot_expression_protocol_privacy_checked']
  };
  return {
    pipelineVersion: 'shime-expression-protocol-pipeline-v1',
    fusionSummary: summarizeShimeEcosystemFusion(fusionResult),
    expressionPlan,
    expressionEnvelope,
    fakeTransportTranscript,
    esp32LogPreview,
    safetyResult,
    privacyResult,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    evidenceSummary: {
      envelope: summarizeRobotExpressionEnvelope(expressionEnvelope),
      fakeTranscript: summarizeFakeExpressionTransportTranscript(fakeTransportTranscript),
      esp32LogPreview: summarizeEsp32ExpressionLogPreview(esp32LogPreview)
    },
    reasonCodes: ['robot_expression_protocol_pipeline_completed']
  };
}

export function summarizeRobotExpressionProtocolPipeline(result = {}) {
  return {
    pipelineVersion: result.pipelineVersion || 'shime-expression-protocol-pipeline-v1',
    expressionFamily: result.expressionEnvelope?.expressionFamily || 'neutral_presence',
    envelopeStatus: result.evidenceSummary?.envelope?.validationStatus || 'unknown',
    fakeTransportLastAck: result.evidenceSummary?.fakeTranscript?.lastAckStatus || 'none',
    esp32Accepted: result.esp32LogPreview?.accepted === true,
    safetyOk: result.safetyResult?.ok === true,
    privacyOk: result.privacyResult?.ok === true,
    dryRunOnly: result.dryRunOnly === true,
    sendStatus: result.sendStatus || 'not_sent',
    reasonCodes: [...(result.reasonCodes || [])]
  };
}

