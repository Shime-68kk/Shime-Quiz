import { describe, expect, it } from 'vitest';
import { runRobotExpressionProtocolPipeline } from '../../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';
import { runRobotExpressionProtocolBenchmark } from '../../../src/shimeIntelligence/robotExpressionProtocolBenchmark.js';
import { reviewExpressionProtocolArtifacts } from '../../../src/shimeIntelligence/expressionProtocolReview.js';

function artifacts() {
  const pipeline = runRobotExpressionProtocolPipeline({ fsrs: { dueCount: 3 }, robotProfile: { supportsDisplay: true, motionLocked: true } });
  return {
    'shime-expression-protocol-pipeline.json': pipeline,
    'shime-expression-protocol-benchmark.json': { ...runRobotExpressionProtocolBenchmark({ protocolScenarioCount: 120, attackScenarioCount: 64 }), protocolScenarioCount: 30000, attackScenarioCount: 3000 },
    'shime-esp32-expression-log-contract.json': pipeline.esp32LogPreview,
    'shime-expression-protocol-evidence.json': { ok: true },
    'shime-expression-envelope-golden.json': pipeline.expressionEnvelope
  };
}

describe('expressionProtocolReview', () => {
  it('passes complete artifacts', () => {
    expect(reviewExpressionProtocolArtifacts(artifacts()).overallStatus).toBe('PASS');
  });

  it('fails missing artifact', () => {
    const value = artifacts();
    delete value['shime-expression-envelope-golden.json'];
    expect(reviewExpressionProtocolArtifacts(value).overallStatus).toBe('FAIL');
  });
});

