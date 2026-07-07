import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewShimeEcosystemEvidence, SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS } from '../../src/shimeIntelligence/shimeEcosystemEvidenceReview.js';
import { runShimePolicyQualityAudit } from '../../src/shimeIntelligence/shimePolicyQualityAudit.js';
import { writeShimeJson } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/generated/shime-intelligence');

function readArtifact(name) {
  const filePath = path.join(OUT, name);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, 'utf8');
  if (name.endsWith('.json')) return JSON.parse(raw);
  return raw;
}

export function runShimeEcosystemEvidenceReviewReport() {
  const artifacts = Object.fromEntries(SHIME_ECOSYSTEM_REVIEW_REQUIRED_ARTIFACTS.map(name => [name, readArtifact(name)]));
  const review = reviewShimeEcosystemEvidence(artifacts);
  const policyAudit = runShimePolicyQualityAudit();
  const reviewArtifact = writeShimeJson(path.join(OUT, 'shime-ecosystem-evidence-review.json'), review);
  const policyArtifact = writeShimeJson(path.join(OUT, 'shime-policy-quality-audit.json'), policyAudit);
  return { review, policyAudit, artifacts: [reviewArtifact, policyArtifact] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { review, policyAudit, artifacts } = runShimeEcosystemEvidenceReviewReport();
  console.log(`[SHIME EVIDENCE REVIEW] status=${review.overallStatus} blockers=${review.blockers.length} warnings=${review.warnings.length}`);
  console.log(`[SHIME POLICY AUDIT] status=${policyAudit.overallStatus} score=${policyAudit.policyQualityScore}`);
  artifacts.forEach(file => console.log(`[ARTIFACT] ${path.relative(ROOT, file)}`));
  process.exitCode = review.overallStatus === 'FAIL' || policyAudit.overallStatus === 'FAIL' ? 1 : 0;
}
