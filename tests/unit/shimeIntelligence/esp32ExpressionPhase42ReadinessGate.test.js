import { describe, expect, it } from 'vitest';
import { createEsp32ExpressionPhase42ReadinessGate } from '../../../src/shimeIntelligence/esp32ExpressionPhase42ReadinessGate.js';

const base = {
  phase39ProtocolBenchmarkPass: true,
  phase40HostSimulatorPass: true,
  phase41FirmwarePlanningPass: true,
  goldenFixturesGenerated: true,
  serialQaKitGenerated: true,
  expectedLogsGenerated: true,
  parserDesignGenerated: true,
  rollbackPlanGenerated: true,
  firmwareScopeIsolated: true,
  noMotion: true,
  noRadioRequired: true,
  noDeviceBridgeRuntimeRequired: true
};

describe('esp32ExpressionPhase42ReadinessGate', () => {
  it('warns when manual QA is pending but passes planning blockers', () => {
    const gate = createEsp32ExpressionPhase42ReadinessGate({ ...base, phase38ManualQaPass: false });
    expect(gate.readinessStatus).toBe('PASS_WITH_WARNINGS');
    expect(gate.warnings).toContain('phase38_manual_qa_pending_or_ack_required');
  });

  it('blocks missing required planning artifacts', () => {
    expect(createEsp32ExpressionPhase42ReadinessGate({ ...base, serialQaKitGenerated: false }).blockers).toContain('missing_gate:serialQaKitGenerated');
  });
});

