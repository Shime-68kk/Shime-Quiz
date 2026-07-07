import { describe, expect, it } from 'vitest';
import { runRobotExpressionProtocolPipeline } from '../../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';
import { runRobotExpressionProtocolBenchmark } from '../../../src/shimeIntelligence/robotExpressionProtocolBenchmark.js';
import { createRobotExpressionProtocolManualQaModel } from '../../../src/shimeIntelligence/robotExpressionProtocolManualQaModel.js';
import { reviewRobotExpressionProtocolEvidence } from '../../../src/shimeIntelligence/robotExpressionProtocolEvidenceReview.js';

describe('robotExpressionProtocolEvidenceReview', () => {
  it('accepts complete protocol evidence', () => {
    const pipeline = runRobotExpressionProtocolPipeline({ fsrs: { dueCount: 2 }, robotProfile: { supportsDisplay: true, motionLocked: true } });
    const review = reviewRobotExpressionProtocolEvidence({
      'shime-expression-protocol-pipeline.json': pipeline,
      'shime-expression-protocol-benchmark.json': { ...runRobotExpressionProtocolBenchmark({ protocolScenarioCount: 120, attackScenarioCount: 64 }), protocolScenarioCount: 30000, attackScenarioCount: 3000 },
      'shime-esp32-expression-log-contract.json': pipeline.esp32LogPreview,
      'shime-expression-protocol-evidence.json': { placeholder: true },
      'shime-expression-protocol-manual-qa.json': createRobotExpressionProtocolManualQaModel(),
      'shime-expression-envelope-golden.json': pipeline.expressionEnvelope
    });
    expect(review.ok).toBe(true);
  });
});

