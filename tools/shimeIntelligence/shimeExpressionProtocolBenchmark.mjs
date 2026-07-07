import { runRobotExpressionProtocolBenchmark } from '../../src/shimeIntelligence/robotExpressionProtocolBenchmark.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const result = runRobotExpressionProtocolBenchmark({
  protocolScenarioCount: 30000,
  attackScenarioCount: 3000
});

if (!result.passed) {
  throw new Error('Expression protocol benchmark failed.');
}

writeShimeJson('docs/generated/shime-intelligence/shime-expression-protocol-benchmark.json', result);

console.log(`[SHIME EXPRESSION PROTOCOL BENCHMARK] status=PASS scenarios=${result.protocolScenarioCount} attacks=${result.attackScenarioCount}`);
console.log('[ARTIFACT] docs/generated/shime-intelligence/shime-expression-protocol-benchmark.json');

