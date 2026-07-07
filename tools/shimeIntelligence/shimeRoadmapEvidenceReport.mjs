import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeShimeMarkdown } from './shimeEcosystemEvidenceWriter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function runShimeRoadmapEvidenceReport() {
  const artifact = writeShimeMarkdown(path.join(ROOT, 'docs/generated/shime-intelligence/shime-roadmap-evidence.md'), `
# Shime Roadmap Evidence

- Shime Robot is the public product face.
- Shime Quiz remains the local-first learning brain.
- FSRS-derived buckets feed memory-state capsules.
- Robot behavior remains downstream, expression-only, and dry-run.
- Transport planning is recommendation-only.
- Timetable planning is suggestion-only.
- No cloud is required.
- Future motion remains a separate high-risk phase.
`);
  return { artifact };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { artifact } = runShimeRoadmapEvidenceReport();
  console.log(`[SHIME ROADMAP] artifact=${path.relative(ROOT, artifact)}`);
}
