import { describe, expect, it } from 'vitest';
import {
  runRobotExpressionProtocolPipeline,
  summarizeRobotExpressionProtocolPipeline
} from '../../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';

describe('robotExpressionProtocolPipeline', () => {
  it('runs Shime fusion through expression envelope, fake transcript, and log-only preview', () => {
    const result = runRobotExpressionProtocolPipeline({
      fsrs: { dueCount: 9, retrievability: 0.45, stability: 8, difficulty: 5 },
      robotProfile: { supportsDisplay: true, supportsLed: true, supportsSound: true, motionLocked: true },
      transport: { userConsentState: 'not_requested' }
    }, { scenarioId: 'pipeline_unit' });
    expect(result.safetyResult.ok).toBe(true);
    expect(result.fakeTransportTranscript.rows.some(row => row.ackStatus === 'accepted_dry_run')).toBe(true);
    expect(result.esp32LogPreview.accepted).toBe(true);
    expect(summarizeRobotExpressionProtocolPipeline(result)).toMatchObject({
      esp32Accepted: true,
      dryRunOnly: true,
      sendStatus: 'not_sent'
    });
  });

  it('neutralizes sensitive input into blocked privacy status without raw output', () => {
    const result = runRobotExpressionProtocolPipeline({
      fsrs: { question: 'blocked' },
      robotProfile: { supportsDisplay: true, motionLocked: true }
    }, { scenarioId: 'pipeline_attack' });
    expect(result.expressionEnvelope.privacyStatus).toBe('blocked');
    expect(JSON.stringify(result)).not.toContain('blocked_fixture_raw_value');
  });
});

