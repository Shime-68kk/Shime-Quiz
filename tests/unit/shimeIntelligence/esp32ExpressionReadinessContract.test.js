import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionReadinessContract } from '../../../src/shimeIntelligence/esp32ExpressionReadinessContract.js';

const complete = {
  envelopeSchemaStable: true,
  goldenFixturesGenerated: true,
  hostSimulatorPasses: true,
  validatorPasses: true,
  serializerRoundTripPasses: true,
  sensitiveAttacksRejected: true,
  secretMaterialRejected: true,
  motionLocked: true,
  noMotorServoCommands: true,
  noRadioImplementationRequired: true,
  serialQaPlanExists: true,
  hardwareManualQaChecklistExists: true,
  rollbackPlanExists: true,
  firmwareScopeIsolated: true,
  noRealRobotSendFromApp: true
};

describe('esp32ExpressionReadinessContract', () => {
  it('passes when all gates are present', () => {
    expect(createEsp32ExpressionReadinessContract(complete).gateStatus).toBe('PASS');
  });

  it('fails when golden fixtures are missing', () => {
    expect(createEsp32ExpressionReadinessContract({ ...complete, goldenFixturesGenerated: false }).blockers).toContain('gate_not_met:goldenFixturesGenerated');
  });
});

