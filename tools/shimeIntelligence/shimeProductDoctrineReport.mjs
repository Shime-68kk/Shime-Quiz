import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getShimeProductDoctrine, summarizeShimeProductDoctrine, validateShimeProductDoctrine } from '../../src/shimeIntelligence/productDoctrine.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeProductDoctrineReport() {
  const doctrine = getShimeProductDoctrine();
  const validation = validateShimeProductDoctrine(doctrine);
  const report = {
    status: validation.ok ? 'PASS' : 'FAIL',
    summary: summarizeShimeProductDoctrine(doctrine),
    failures: validation.failures,
    robotLedPositioning: true,
    appCanonicalLearningAuthority: true,
    dryRunOnly: true
  };
  const artifact = writeShimeJson(path.join(ROOT, 'docs/generated/shime-intelligence/shime-product-doctrine-report.json'), report);
  return { report, artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report, artifact } = runShimeProductDoctrineReport();
  console.log(`[SHIME PRODUCT DOCTRINE] status=${report.status} artifact=${path.relative(ROOT, artifact)}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
