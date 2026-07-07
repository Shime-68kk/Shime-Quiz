import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processDeviceBridgeEventSequence } from '../../src/companion/companionBridgePipeline.js';
import { runV2DryRunFromTranscript } from '../../src/components/settings/companionV2PanelAdapter.js';
import { compareCompanionEngineOutputs } from '../../src/components/settings/companionEngineComparisonModel.js';
import { summarizeCompanionTranscript } from '../../src/components/settings/companionDevPanelModel.js';
import { getCompanionReplayFixtures } from './companionReplayFixtures.mjs';
import { writeEvidenceJson } from './companionEvidenceSnapshotWriter.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function legacyTranscriptForScenario(scenario) {
  const result = processDeviceBridgeEventSequence(scenario.events || []);
  return summarizeCompanionTranscript(result.results.map(entry => entry.transcriptEntry)).transcript;
}

export function createCompanionV2VsLegacyComparisonReport() {
  const rows = getCompanionReplayFixtures().slice(0, 18).map((scenario, index) => {
    const legacyRows = legacyTranscriptForScenario(scenario);
    const v2 = runV2DryRunFromTranscript(legacyRows);
    const comparison = compareCompanionEngineOutputs(legacyRows, v2.rows);
    const legacyLast = legacyRows.at(-1) || {};
    const v2Last = v2.rows.at(-1) || {};
    return {
      scenarioId: `scenario_${String(index + 1).padStart(3, '0')}`,
      legacyIntent: legacyLast.companionIntent || 'none',
      legacyCommand: legacyLast.robotCommand || 'neutral',
      v2Intent: v2Last.v2Intent || 'none',
      v2Command: v2Last.v2Command || 'neutral',
      comparisonStatus: comparison.comparisonStatus,
      warnings: comparison.warnings,
      recommendation: comparison.recommendation
    };
  });
  return {
    reportVersion: 'companion-v2-vs-legacy-1',
    scenarioCount: rows.length,
    rows,
    passed: rows.every(row => row.comparisonStatus !== 'v2_needs_review')
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = createCompanionV2VsLegacyComparisonReport();
  const out = path.join(PROJECT_ROOT, 'docs/generated/companion-v2-vs-legacy-comparison.json');
  writeEvidenceJson(out, report);
  console.log(`[COMPANION V2 COMPARISON] scenarios=${report.scenarioCount} passed=${report.passed ? 'yes' : 'no'} artifact=${path.relative(PROJECT_ROOT, out)}`);
  process.exitCode = report.passed ? 0 : 1;
}
