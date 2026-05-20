#!/usr/bin/env node
/**
 * Phase 23D static validator - backup reminder + pre-risk-action friction design gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DESIGN_DOC = `docs/research/phase23d-backup-reminder-risk-friction-design.md`;
const RELEASE_SUMMARY = `docs/release/phase23d-backup-reminder-risk-friction-summary.md`;
const VALIDATOR = `scripts/validate-phase23d-backup-reminder-risk-friction-design.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const historicalValidatorForwardCompatFiles = [
  `scripts/validate-backup-transfer-safety-hardening.js`,
  `scripts/validate-cross-device-export-import.js`,
  `scripts/validate-cross-device-transfer-track-closure.js`,
  `scripts/validate-cross-device-transfer-ux-copy.js`,
  `scripts/validate-cross-device-transfer-ux-decision.js`,
  `scripts/validate-dashboard-today-card-runtime.js`,
  `scripts/validate-dashboard-today-card-ux-plan.js`,
  `scripts/validate-edugen-boundary-polish.js`,
  `scripts/validate-final-main-release-authorization.js`,
  `scripts/validate-final-public-release-readiness-reaudit.js`,
  `scripts/validate-final-release-execution-checklist.js`,
  `scripts/validate-github-release-publication-plan.js`,
  `scripts/validate-manual-evidence-execution-checklist.js`,
  `scripts/validate-manual-evidence-results-log.js`,
  `scripts/validate-manual-evidence-run-pack.js`,
  `scripts/validate-phase12-closure-release-decision.js`,
  `scripts/validate-phase12-roadmap-risk-register.js`,
  `scripts/validate-phase13-closure.js`,
  `scripts/validate-phase13-fsrs-plan.js`,
  `scripts/validate-phase13-local-adaptive-roadmap.js`,
  `scripts/validate-phase13-review-engine-audit.js`,
  `scripts/validate-phase14a-scheduler-adapter.js`,
  `scripts/validate-phase14b-fsrs-wrapper.js`,
  `scripts/validate-phase14c-fsrs-persistence-harness.js`,
  `scripts/validate-phase14d-fsrs-adapter-routing.js`,
  `scripts/validate-phase14e-fsrs-user-facing-entry.js`,
  `scripts/validate-phase14f-hf1-baseline-validation-recovery.js`,
  `scripts/validate-phase14f-toggle-plan.js`,
  `scripts/validate-phase14g-settings-storage.js`,
  `scripts/validate-phase14h-fsrs-toggle-ui.js`,
  `scripts/validate-phase14i-fsrs-two-step-fixture.js`,
  `scripts/validate-phase14j-fsrs-enrollment-readiness.js`,
  `scripts/validate-phase14k-fsrs-readiness-audit.js`,
  `scripts/validate-phase14l-production-enrollment-wiring.js`,
  `scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js`,
  `scripts/validate-phase14n-production-studyroom-two-step-bridge.js`,
  `scripts/validate-phase14o-fsrs-active-scheduling-decision-gate.js`,
  `scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js`,
  `scripts/validate-phase15a-fsrs-active-scheduling-architecture.js`,
  `scripts/validate-phase15b-active-fsrs-scheduling-double-gated.js`,
  `scripts/validate-phase15c-dashboard-mixed-scheduler-due-count.js`,
  `scripts/validate-phase15d-active-fsrs-runtime-smoke-rollback-audit.js`,
  `scripts/validate-phase15e-controlled-internal-activation-harness.js`,
  `scripts/validate-phase15f-studyroom-copy-ux-alignment.js`,
  `scripts/validate-phase15g-release-claim-guardrail-reaudit.js`,
  `scripts/validate-phase15h-fsrs-foundation-closure-phase16-readiness.js`,
  `scripts/validate-phase16b-hybrid-local-first-optional-sync-direction.js`,
  `scripts/validate-phase16c-storage-large-import-edugen-risk-audit.js`,
  `scripts/validate-phase16d-shime-study-identity-product-principles.js`,
  `scripts/validate-phase16e-visual-polish-quick-wins.js`,
  `scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js`,
  `scripts/validate-phase16g-edugen-draft-review-import-flow.js`,
  `scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js`,
  `scripts/validate-phase16i-public-readme-landing-screenshots-demo-refresh.js`,
  `scripts/validate-phase16j-mobile-ux-pwa-quick-wins.js`,
  `scripts/validate-phase16k-storage-quota-backup-before-import-hardening.js`,
  `scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js`,
  `scripts/validate-phase17a-backup-rollback-harness-before-migration.js`,
  `scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js`,
  `scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js`,
  `scripts/validate-phase17d-migration-journal-event-log-architecture.js`,
  `scripts/validate-phase17e-per-key-migration-manifest-design.js`,
  `scripts/validate-phase17f-test-only-migration-journal-prototype.js`,
  `scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js`,
  `scripts/validate-phase17h-single-key-reversible-migration-pilot.js`,
  `scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js`,
  `scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js`,
  `scripts/validate-phase18b-backup-export-compatibility-audit.js`,
  `scripts/validate-phase18c-manual-migration-ux-plan.js`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
  `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`,
  `scripts/validate-phase20e-real-user-testing-results-log.js`,
  `scripts/validate-phase20f-performance-quota-import-stress-results-log.js`,
  `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`,
  `scripts/validate-phase20h-real-user-testing-execution-results.js`,
  `scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`,
  `scripts/validate-phase20j-final-beta-readiness-redecision.js`,
  `scripts/validate-phase21a-manual-evidence-execution-run-pack.js`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
  `scripts/validate-phase21e-manual-evidence-first-run-pack.js`,
  `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
  `scripts/validate-phase22a-actual-first-manual-evidence-run.js`,
  `scripts/validate-phase22b-fill-real-user-evidence-results.js`,
  `scripts/validate-phase22c-fill-stress-evidence-results.js`,
  `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`,
  `scripts/validate-phase22e-broader-manual-evidence.js`,
  `scripts/validate-phase22f-actual-stress-run.js`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `scripts/validate-phase23b-data-survival-ux-copy.js`,
  `scripts/validate-phase23c-backup-health-design.js`,
  `scripts/validate-release-candidate-freeze-final-decision.js`,
  `scripts/validate-release-candidate-tag-publish-gate.js`,
  `scripts/validate-release-package-assembly-plan.js`,
  `scripts/validate-release-tag-creation-plan.js`,
  `scripts/validate-storage-capacity-indexeddb-migration-plan.js`,
  `scripts/validate-storage-quota-warning-runtime.js`,
  `scripts/validate-study-flow-micro-feedback-plan.js`,
  `scripts/validate-study-flow-micro-feedback-runtime.js`,
  `scripts/validate-unit-test-foundation-plan.js`,
  `scripts/validate-vitest-unit-test-foundation.js`,
  `scripts/validate-web-share-mobile-sharing-prototype-plan.js`,
  `scripts/validate-web-share-runtime-fallback-hardening.js`,
  `scripts/validate-web-share-runtime-prototype.js`,
];

const phase23dPaths = [DESIGN_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase23eForwardCompatPaths = [`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`, `docs/release/phase23e-data-survival-comprehension-plan-summary.md`, `scripts/validate-phase23e-data-survival-comprehension-plan.js`];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const phase24bForwardCompatPaths = [`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`, `docs/release/phase24b-storage-adapter-boundary-summary.md`, `scripts/validate-phase24b-storage-adapter-boundary-decision.js`];
const phase24cForwardCompatPaths = [`src/ui/helpTourStorage.js`, `src/ui/helpTour.js`, `tests/unit/helpTourStorageAdapterScaffold.test.js`, `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`, `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`, `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`];
const allowedChanged = new Set([
  WORKFLOW,
  ...phase23dPaths,
  ...historicalValidatorForwardCompatFiles,
]);
const phase23dForwardCompatPaths = new Set(phase23dPaths);
phase23dForwardCompatPaths.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase23dForwardCompatPaths.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase23dForwardCompatPaths.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChanged.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChanged.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChanged.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
for (const path of phase23fForwardCompatPaths) allowedChanged.add(path);
for (const path of phase24aForwardCompatPaths) allowedChanged.add(path);
for (const path of phase24bForwardCompatPaths) allowedChanged.add(path);
for (const path of phase24cForwardCompatPaths) allowedChanged.add(path);
for (const path of phase23fForwardCompatPaths) phase23dForwardCompatPaths.add(path);
for (const path of phase24aForwardCompatPaths) phase23dForwardCompatPaths.add(path);
for (const path of phase24bForwardCompatPaths) phase23dForwardCompatPaths.add(path);

const statusToken = `PHASE23D_BACKUP_REMINDER_RISK_FRICTION_DESIGN_STATUS: COMPLETED_DOCS_ONLY`;
const nextPhaseText = `Phase 23E — Evidence-Run Plan for Data-Survival Comprehension`;
const nextPhaseLine = `Next recommended phase: ${nextPhaseText}`;

const designHeadings = [
  `# Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Product stance`,
  `## Reminder design principles`,
  `## Reminder states`,
  `## Pre-risk-action friction surfaces`,
  `## Vietnamese copy examples`,
  `## Tone and UX rules`,
  `## Manual backup/export wording rules`,
  `## Platform backup uncertainty`,
  `## What Phase 23D can claim`,
  `## What Phase 23D must not claim`,
  `## Implementation prerequisites`,
  `## Phase 23E roadmap implication`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 23D — Backup Reminder + Risk Friction Summary`,
  `## Status token`,
  `## Scope`,
  `## Design summary`,
  `## Reminder states`,
  `## Pre-risk-action surfaces`,
  `## Product stance`,
  `## What Phase 23D can claim`,
  `## What Phase 23D must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 23D is a docs-only backup reminder and pre-risk-action friction design gate.`,
  `Phase 23D does not implement runtime UI.`,
  `Phase 23D does not implement reminder scheduling.`,
  `Phase 23D does not implement backup health tracking.`,
  `Phase 23D does not change backup/export/restore behavior.`,
  `Phase 23D does not change import behavior.`,
  `Phase 23D does not make Shime BETA_READY.`,
  `Phase 23D does not make backup/export/restore adapter-aware.`,
  `Phase 23D does not verify platform backup behavior.`,
  `Phase 23D does not add sync, cloud, account, auth, or backend behavior.`,
];

const designCoverageTerms = [
  `backup reminder purpose`,
  `backup reminder cadence direction`,
  `gentle reminder state`,
  `visible reminder state`,
  `persistent non-blocking reminder state`,
  `snooze or dismiss direction`,
  `relationship to NO_BACKUP_YET`,
  `relationship to FRESH_BACKUP`,
  `relationship to AGING_BACKUP`,
  `relationship to STALE_BACKUP`,
  `relationship to UNKNOWN_BACKUP_STATE`,
  `pre-risk-action friction principles`,
  `restore overwrite prompt direction`,
  `large import backup-before-action prompt direction`,
  `manual transfer or device switch prompt direction`,
  `clear-data or uninstall education direction`,
  `destructive-action warning direction`,
  `never-block-normal-study principle`,
  `non-blaming recovery tone`,
  `manual backup/export is not sync`,
  `platform backup is not guaranteed`,
  `implementation prerequisites`,
  `Phase 23E roadmap implication`,
];

const reminderStates = [
  `NO_REMINDER_NEEDED`,
  `GENTLE_BACKUP_NUDGE`,
  `VISIBLE_BACKUP_REMINDER`,
  `PERSISTENT_NON_BLOCKING_REMINDER`,
  `PRE_RISK_ACTION_PROMPT`,
  `UNKNOWN_BACKUP_STATUS_PROMPT`,
];

const stateRequiredColumns = [
  `Trigger direction`,
  `Product meaning`,
  `Suggested Vietnamese label`,
  `Suggested helper copy`,
  `Recommended tone`,
  `Blocking or non-blocking`,
  `What not to imply`,
];

const preRiskSurfaces = [
  `restore overwrite`,
  `large import`,
  `manual transfer to another device`,
  `before destructive local-data action`,
  `after detecting no backup yet`,
  `after detecting stale backup`,
  `unknown backup state before risky action`,
];

const copyExamples = [
  `Gentle backup nudge`,
  `Visible backup reminder`,
  `Persistent non-blocking stale-backup reminder`,
  `Pre-restore backup prompt`,
  `Restore overwrite confirmation`,
  `Large import backup-before-action prompt`,
  `Manual transfer backup reminder`,
  `Unknown backup status before risky action`,
  `Non-blaming recovery message after missing backup`,
  `Dismiss/snooze helper copy`,
];

const toneRules = [
  `Reminder copy must be calm and non-blaming.`,
  `Reminder copy must be Vietnamese-first.`,
  `Reminder copy must not create panic.`,
  `Normal study flow must not be blocked by default.`,
  `Pre-risk-action prompts may add friction only before risky actions.`,
  `Manual backup/export must never be called sync.`,
  `Platform backup must never be implied as guaranteed.`,
  `Backup reminders must not claim to prevent all data loss.`,
];

const allowedClaims = [
  `Backup reminder design direction exists.`,
  `Pre-risk-action friction design direction exists.`,
  `Vietnamese-first reminder copy has been drafted.`,
  `Non-blocking reminder principles have been defined.`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `backup reminder is implemented`,
  `pre-risk-action friction is implemented`,
  `backup health tracking is implemented`,
  `last-backup tracking is implemented`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
];

const forbiddenPrefixes = [
  `src/`,
  `tests/`,
  `e2e/`,
  `docs/adr/`,
];
const forbiddenFiles = [`package.json`, `package-lock.json`, `sw.js`];
const forbiddenPathPatterns = [
  /(^|\/)(runtime|import|storage|backup|restore)(\/|$)/i,
  /(^|\/)(fsrs|sync|cloud|account|auth|backend)(\/|$)/i,
  /(^|\/)(dependencies|telemetry|analytics)(\/|$)/i,
];
const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `coverage`,
  `test-results`,
  `playwright-report`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
];

function fail(message) {
  console.error(`Phase 23D validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
}

function normalize(text) {
  return text.replace(/\s+/g, ` `).trim();
}

function runGit(command) {
  try {
    return execSync(command, { encoding: `utf8`, stdio: [`ignore`, `pipe`, `ignore`] }).trim();
  } catch {
    return ``;
  }
}

function lines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function changedFiles() {
  const base = runGit(`git merge-base HEAD origin/main`);
  const diffFiles = base ? lines(runGit(`git diff --name-only ${base} HEAD`)) : [];
  const localFiles = [
    ...lines(runGit(`git diff --name-only`)),
    ...lines(runGit(`git diff --cached --name-only`)),
    ...lines(runGit(`git ls-files --others --exclude-standard`)),
  ].filter(file => !generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) && !file.endsWith(`.log`));
  return [...new Set([...diffFiles, ...localFiles])].sort();
}

function combinedDocs() {
  return `${read(DESIGN_DOC)}\n${read(RELEASE_SUMMARY)}`;
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23c = `node scripts/validate-phase23c-backup-health-design.js`;
  const phase23d = `node scripts/validate-phase23d-backup-reminder-risk-friction-design.js`;
  if (!workflow.includes(phase23d)) fail(`CI does not register Phase 23D validator`);
  if (workflow.indexOf(phase23d) <= workflow.indexOf(phase23c)) fail(`CI must register Phase 23D after Phase 23C`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateRequiredDocs() {
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (!text.includes(statusToken)) fail(`${file} missing status token`);
    if (!text.includes(nextPhaseLine)) fail(`${file} missing exact next phase line`);
    for (const statement of positioningStatements) {
      if (!text.includes(statement)) fail(`${file} missing positioning statement: ${statement}`);
    }
    for (const rule of toneRules) {
      if (!text.includes(rule)) fail(`${file} missing tone/UX rule: ${rule}`);
    }
    for (const claim of allowedClaims) {
      if (!text.includes(claim)) fail(`${file} missing allowed claim: ${claim}`);
    }
  }
}

function validateDesignCoverage() {
  const design = read(DESIGN_DOC);
  const normalized = normalize(design).toLowerCase();
  for (const term of designCoverageTerms) {
    if (!normalized.includes(term.toLowerCase())) fail(`Design doc missing required coverage term: ${term}`);
  }
  for (const state of reminderStates) {
    if (!design.includes(state)) fail(`Design doc missing reminder state: ${state}`);
    const row = design.split(/\r?\n/).find(line => line.includes(`\`${state}\``) && line.trim().startsWith(`|`));
    if (!row) fail(`Design doc missing table row for reminder state: ${state}`);
    const cells = row.split(`|`).slice(1, -1).map(cell => cell.trim());
    if (cells.length < 8) fail(`Reminder state ${state} row must include all required fields`);
    for (const cell of cells) {
      if (!cell) fail(`Reminder state ${state} has an empty required field`);
    }
  }
  for (const column of stateRequiredColumns) {
    if (!design.includes(column)) fail(`Design doc missing state content column: ${column}`);
  }
  for (const surface of preRiskSurfaces) {
    if (!normalized.includes(surface.toLowerCase())) fail(`Design doc missing pre-risk surface: ${surface}`);
  }
  for (const example of copyExamples) {
    if (!design.includes(example)) fail(`Design doc missing Vietnamese copy example: ${example}`);
  }
  const vietnameseMarkers = [`sao lưu`, `tệp`, `dữ liệu`, `khôi phục`, `thiết bị`];
  for (const marker of vietnameseMarkers) {
    if (!design.toLowerCase().includes(marker)) fail(`Design doc does not appear Vietnamese-first: ${marker}`);
  }
}

function validateForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 700), index + needle.length + 700);
      const guarded = /does not|must not|do not|not claim|not claimed|not make|not implement|not verify|without claiming|guardrails|verification required|reject|rejected|not guaranteed|not automatic|must not imply|no runtime|no sync|is not sync|no platform backup|not called sync/.test(context);
      if (!guarded) fail(`Forbidden positive claim appears outside guarded context: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
}

function validateChangedScope() {
  const files = changedFiles();
  for (const file of files) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact must not be tracked or present in changed files: ${file}`);
    }
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (allowedChanged.has(file)) continue;
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file))) fail(`Forbidden runtime area changed: ${file}`);
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase23e-data-survival-comprehension-plan.js`) continue;
    if (file === `scripts/validate-phase23f-phase23-decision-gate.js`) continue;
    if (file === `scripts/validate-phase24a-residual-direct-storage-audit.js`) continue;
    if (file === `scripts/validate-phase24b-storage-adapter-boundary-decision.js`) continue;
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    const removedLines = diff.split(/\r?\n/)
      .filter(line => line.startsWith(`-`) && !line.startsWith(`---`))
      .map(line => line.slice(1).trim());
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      if (line.includes(`phase23eForwardCompatPaths`)) continue;
      if (line.includes(`phase23fForwardCompatPaths`)) continue;
      if (line.includes(`phase24aForwardCompatPaths`)) continue;
      if (line.includes(`phase24bForwardCompatPaths`)) continue;
      if (line.includes(`phase24cForwardCompatPaths`)) continue;
      if (line.includes(`Phase 24C forward-compat entries`)) continue;
      if (line.includes(`allowedChanged.has(file)`)) continue;
      if (line.includes(`AllowedChangedFiles.has(file)`)) continue;
      if (line.includes(`allowedChangedFiles.has(file)`)) continue;
      if (line.includes(`isPhase23f`)) continue;
      if (line.includes(`isPhase24a`)) continue;
      if (line.includes(`isPhase24b`)) continue;
      if (line.includes(`isPhase24c`)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase23dForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-23D forward-compat addition: ${line}`);
      }
      for (const path of [...phase23dForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths]) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 23D path only: ${line}`);
        }
      }
    }
  }
}

function validateGeneratedArtifactsAbsent() {
  for (const file of lines(runGit(`git ls-files`))) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked: ${file}`);
    }
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be tracked: ${file}`);
  }
  for (const file of lines(runGit(`git ls-files --others --exclude-standard`))) {
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be present: ${file}`);
  }
}

requireHeadings(DESIGN_DOC, designHeadings);
requireHeadings(RELEASE_SUMMARY, summaryHeadings);
validateWorkflow();
validateRequiredDocs();
validateDesignCoverage();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 23D backup reminder risk friction design validation passed.`);
