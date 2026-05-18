#!/usr/bin/env node
/**
 * scripts/validate-phase18c-manual-migration-ux-plan.js
 *
 * Phase 18C static validator — Manual Migration UX Plan.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DOCS_FILE        = 'docs/phase18c-manual-migration-ux-plan.md';
const VALIDATOR_SCRIPT = 'scripts/validate-phase18c-manual-migration-ux-plan.js';
const WORKFLOW_FILE    = '.github/workflows/e2e-smoke.yml';
const PHASE18B_VALIDATOR = 'scripts/validate-phase18b-backup-export-compatibility-audit.js';

const phase18cAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Historical validator forward-compat edits
  'scripts/validate-phase16l-local-first-hybrid-storage-adapter-plan.js',
  'scripts/validate-phase17a-backup-rollback-harness-before-migration.js',
  'scripts/validate-phase17b-storage-adapter-localstorage-scaffold.js',
  'scripts/validate-phase17c-indexeddb-migration-dry-run-harness.js',
  'scripts/validate-phase17d-migration-journal-event-log-architecture.js',
  'scripts/validate-phase17e-per-key-migration-manifest-design.js',
  'scripts/validate-phase17f-test-only-migration-journal-prototype.js',
  'scripts/validate-phase17g-single-key-dry-run-migration-rehearsal.js',
  'scripts/validate-phase17h-single-key-reversible-migration-pilot.js',
  'scripts/validate-phase17i-local-migration-readiness-closure-phase18-gate.js',
  'scripts/validate-phase18a-test-only-indexeddb-adapter-prototype.js',
  PHASE18B_VALIDATOR,
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  // Phase 18D forward-compat entries (Internal / Test-Only Local Migration Pilot)
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  // Phase 18E forward-compat entries (Limited Local Backend Pilot with Rollback Gates)
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  // Phase 19C forward-compat entries (Optional Sync Conflict Model Design Gate)
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  // Phase 19D forward-compat entries (No-Cloud / Default-Off Trust Copy Gate)
  `docs/trust/no-cloud-default-off.vi.md`,
  `docs/trust/no-cloud-default-off.md`,
  `docs/adr/phase19d-no-cloud-default-off-trust-copy.md`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  // Phase 20A forward-compat entries (Beta Local-First Hybrid Stabilization Gate)
  `docs/adr/phase20a-beta-local-first-hybrid-stabilization.md`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  // Phase 20B forward-compat entries (Real User Testing / Data Safety Feedback Plan)
  `docs/adr/phase20b-real-user-testing-data-safety-feedback.md`,
  `docs/testing/phase20b-real-user-testing-plan.md`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  // Phase 20C forward-compat entries (Performance / Quota / Import Stress Test Plan)
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
]);

const backupRestoreRuntimeFiles = [
  'src/state/v2BackupRestore.js',
  'src/quiz/dataBackup.js',
  'src/ui/dataBackupPanel.js',
];

const forbiddenRuntimeFiles = [
  'src/storage/IndexedDBAdapter.js',
  'src/storage/EventLog.js',
  'src/storage/MigrationJournal.js',
  'src/storage/SyncAdapter.js',
  'src/storage/migrationJournal.js',
  'src/storage/migrationRunner.js',
  'src/storage/migrationManifest.js',
  'src/storage/migrationRegistry.js',
  'src/storage/backupCoverageMap.js',
  'src/state/adapterBackupBridge.js',
];

const forbiddenDependencies = ['idb', 'dexie', 'localforage', 'pouchdb', 'rxdb', 'firebase', 'supabase'];

const generatedArtifacts = [
  'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage', 'FETCH_HEAD', '.env', '.env.local', '.git'
];

const requiredDocSections = [
  '# Phase 18C — Manual Migration UX Plan',
  '## Purpose',
  '## Relationship to Phase 18B backup/export audit',
  '## Current production baseline',
  '## User trust principles',
  '## Manual migration flow concept',
  '## Required user-facing warnings for future phases',
  '## Backup-before-migration UX requirements',
  '## Restore and rollback UX requirements',
  '## Unsupported browser and quota UX requirements',
  '## Vietnamese-first copy direction',
  '## What Phase 18C explicitly does not implement',
  '## Claim boundaries',
  '## Go/no-go criteria for Phase 18D',
  '## Future sequencing',
  '## Acceptance criteria',
];

const requiredUxPlanTerms = [
  'phase 18c',
  'phase 18b',
  'phase 18d',
  'manual migration ux plan',
  'docs/static-validator/ci-only',
  'production ui behavior is unchanged',
  'no ui copy is shipped',
  'no settings toggle',
  'production backup/export behavior is unchanged',
  'localstorage remains the canonical production source of truth',
  'backup/export is not adapter-aware',
  'restore is not adapter-aware',
  'backup-before-migration',
  'restore recovery path',
  'rollback path',
  'unsupported browser',
  'quota',
  'interrupted migration',
  'post-migration verification',
  'no automatic migration at app boot',
  'no silent deletion',
  'vietnamese-first',
  'localstorage canonical',
];

const requiredPhase18DTerms = [
  'internal / test-only local migration pilot',
  'phase 18b and phase 18c',
  'ci is green',
  'phase 18b backup/export audit',
  'single low-risk key family',
  'internal and test-only',
  'no production app boot path',
  'no user-facing toggle',
  'no real user data',
  'localstorage remains the canonical write surface',
  'backup/export behavior remains unchanged',
  'rollback path must be proven',
  'post-migration verification is mandatory',
  'ship a ui toggle',
  'run migration at app boot',
  'indexeddb the production read source',
  'delete localstorage',
  'claim backup/export is adapter-aware',
  'real user data',
  'sync, cloud, account, auth, or backend',
];

const requiredClaimBoundaryTerms = [
  'manual migration ux requirements are planned',
  'backup-first and recovery-aware',
  'production ui behavior remains unchanged',
  'production backup/export behavior remains unchanged',
  'localstorage remains the canonical production source of truth',
  'phase 18d may begin only as an internal/test-only pilot',
  'manual migration ui exists',
  'migration toggle exists',
  'production migration has shipped',
  'production indexeddb storage exists',
  'backup/export supports indexeddb-backed production storage',
  'backup is adapter-aware',
  'restore is adapter-aware',
  'data-loss prevention is guaranteed',
  'live migration is safe',
  'public active fsrs rollout exists',
  'built-in ai or ocr exists',
];

const forbiddenClaimPhrases = [
  'manual migration ui exists',
  'migration toggle exists',
  'production migration has shipped',
  'production indexeddb storage exists',
  'backup/export supports indexeddb-backed production storage',
  'backup is adapter-aware',
  'restore is adapter-aware',
  'data-loss prevention is guaranteed',
  'live migration is safe',
  'cloud sync exists',
  'sync exists',
  'account exists',
  'auth exists',
  'backend exists',
  'public active fsrs rollout exists',
  'built-in ai exists',
  'ocr exists',
];

const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
  `package.json`,
  `package-lock.json`,
];

const phase18cForwardCompatEntries = [
  DOCS_FILE,
  VALIDATOR_SCRIPT,
  // Phase 18D forward-compat entries (Internal / Test-Only Local Migration Pilot)
  `docs/phase18d-internal-test-only-local-migration-pilot.md`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `tests/unit/helpers/internalLocalMigrationPilot.js`,
  `tests/unit/internalLocalMigrationPilot.test.js`,
  // Phase 18E forward-compat entries (Limited Local Backend Pilot with Rollback Gates)
  `docs/phase18e-limited-local-backend-pilot-rollback-gates.md`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `tests/unit/helpers/limitedLocalBackendPilot.js`,
  `tests/unit/limitedLocalBackendPilot.test.js`,
  // Phase 19A forward-compat entries (FSRS Public Opt-In Sequencing Gate)
  `docs/phase19a-fsrs-public-opt-in-sequencing-gate.md`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  // Phase 19B forward-compat entries (Optional Sync Architecture Decision Gate)
  `docs/adr/phase19b-optional-sync-direction.md`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  // Phase 19C forward-compat entries (Optional Sync Conflict Model Design Gate)
  `docs/adr/phase19c-optional-sync-conflict-model.md`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  // Phase 19D forward-compat entries (No-Cloud / Default-Off Trust Copy Gate)
  `docs/trust/no-cloud-default-off.vi.md`,
  `docs/trust/no-cloud-default-off.md`,
  `docs/adr/phase19d-no-cloud-default-off-trust-copy.md`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  // Phase 20A forward-compat entries (Beta Local-First Hybrid Stabilization Gate)
  `docs/adr/phase20a-beta-local-first-hybrid-stabilization.md`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  // Phase 20B forward-compat entries (Real User Testing / Data Safety Feedback Plan)
  `docs/adr/phase20b-real-user-testing-data-safety-feedback.md`,
  `docs/testing/phase20b-real-user-testing-plan.md`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  // Phase 20C forward-compat entries (Performance / Quota / Import Stress Test Plan)
  `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`,
  `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
];

function fail(message) {
  console.error(`Phase 18C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 18C validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; scope checking may be limited: ${command}`);
    return '';
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromBranchBase() {
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true }))
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles(options = {}) {
  return uniqueSorted([
    ...changedFilesFromPullRequestBase(),
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks(options),
  ]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function requiredFilesGuard() {
  read(DOCS_FILE);
  read(VALIDATOR_SCRIPT);
  read(WORKFLOW_FILE);
  read(PHASE18B_VALIDATOR);
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase18bStr = 'node scripts/validate-phase18b-backup-export-compatibility-audit.js';
  const phase18cStr = 'node scripts/validate-phase18c-manual-migration-ux-plan.js';

  if (!text.includes(phase18bStr)) fail(`${WORKFLOW_FILE} must register Phase 18B validator`);
  if (!text.includes(phase18cStr)) fail(`${WORKFLOW_FILE} must register Phase 18C validator`);

  const phase18bPos = text.indexOf(phase18bStr);
  const phase18cPos = text.indexOf(phase18cStr);
  if (phase18cPos <= phase18bPos) fail(`${WORKFLOW_FILE} must register Phase 18C validator after Phase 18B`);

  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function packageGuard() {
  const changed = new Set(changedFiles());
  if (changed.has('package.json')) fail('package.json must not change in Phase 18C');
  if (changed.has('package-lock.json')) fail('package-lock.json must not change in Phase 18C');
}

function noForbiddenDirectoryChangesGuard() {
  for (const file of changedFiles()) {
    if (phase18cAllowedChangedFiles.has(file)) continue;
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'src') fail(`src/ file changed in Phase 18C (forbidden): ${file}`);
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 18C (forbidden): ${file}`);
    if (firstSegment === 'e2e') fail(`e2e/ file changed in Phase 18C (forbidden): ${file}`);
  }
}

function backupRestoreRuntimeGuard() {
  const changed = new Set(changedFiles());
  for (const file of backupRestoreRuntimeFiles) {
    if (changed.has(file)) fail(`Backup/export/restore runtime file changed in Phase 18C (forbidden): ${file}`);
  }
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if (isGeneratedArtifact(file)) continue;
    if (file.startsWith('.claude/')) continue;
    if (phase18cAllowedChangedFiles.has(file)) continue;
    if (file === 'package.json' || file === 'package-lock.json') fail(`${file} must not change in Phase 18C`);
    const firstSegment = file.indexOf('/') >= 0 ? file.slice(0, file.indexOf('/')) : file;
    if (firstSegment === 'src') fail(`src/ file changed in Phase 18C (forbidden): ${file}`);
    if (firstSegment === 'tests') fail(`tests/ file changed in Phase 18C (forbidden): ${file}`);
    if (firstSegment === 'e2e') fail(`e2e/ file changed in Phase 18C (forbidden): ${file}`);
    if (firstSegment === 'docs') fail(`Unexpected docs/ file changed in Phase 18C: ${file}`);
    if (file.startsWith('scripts/validate-') && file.endsWith('.js')) continue;
    warn(`Unexpected file outside allowed Phase 18C scope (non-fatal): ${file}`);
  }
}

function forbiddenRuntimeFilesGuard() {
  for (const path of forbiddenRuntimeFiles) {
    if (fs.existsSync(path)) fail(`Phase 18C must not introduce forbidden runtime file: ${path}`);
  }
}

function forbiddenDependencyGuard() {
  const pkg = read('package.json');
  for (const dep of forbiddenDependencies) {
    const pattern = new RegExp(`"${dep}"\\s*:`);
    if (pattern.test(pkg)) fail(`package.json must not add forbidden dependency: "${dep}"`);
  }
}

function docSectionGuard() {
  const doc = read(DOCS_FILE);
  for (const section of requiredDocSections) {
    if (!doc.includes(section)) fail(`${DOCS_FILE} must include required section: "${section}"`);
  }

  const actualH1H2 = doc.split(/\r?\n/).filter(line => /^#{1,2}\s/.test(line.trim()));
  const expected = new Set(requiredDocSections);
  for (const heading of actualH1H2) {
    if (!expected.has(heading.trim())) fail(`${DOCS_FILE} includes unexpected H1/H2 heading: "${heading.trim()}"`);
  }
}

function requiredTermGuard(label, terms) {
  const doc = read(DOCS_FILE);
  const lower = doc.toLowerCase();
  for (const term of terms) {
    if (!lower.includes(term.toLowerCase())) fail(`${DOCS_FILE} must include required ${label} term: "${term}"`);
  }
}

function forbiddenClaimGuard() {
  const doc = read(DOCS_FILE);
  const lines = doc.split(/\r?\n/);
  let inSkippedSection = false;

  for (const line of lines) {
    if (/^##\s+(What Phase 18C explicitly does not implement|Claim boundaries)/i.test(line)) {
      inSkippedSection = true;
      continue;
    }
    if (/^##\s+/.test(line)) inSkippedSection = false;
    if (inSkippedSection) continue;

    const lineLower = line.toLowerCase();
    for (const claim of forbiddenClaimPhrases) {
      if (!lineLower.includes(claim.toLowerCase())) continue;
      const negated = /no |not |must not|forbidden|do not|absent|without|does not|has not|cannot|unchanged/i.test(line);
      if (!negated) fail(`${DOCS_FILE} must not contain forbidden positive claim: "${claim}" (line: ${line.trim()})`);
    }
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function historicalValidatorForwardCompatGuard() {
  const changed = changedFiles();
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });

  const changedValidators = changed.filter(f =>
    f.startsWith('scripts/validate-') &&
    f.endsWith('.js') &&
    f !== VALIDATOR_SCRIPT
  );

  for (const validatorFile of changedValidators) {
    if (!mergeBase) {
      warn(`Cannot verify ${validatorFile} forward-compat: no merge base.`);
      continue;
    }

    const diff = runGit(`git diff ${mergeBase} HEAD -- "${validatorFile}"`, { silent: true });
    if (!diff) continue;
    if (diff.includes('--- /dev/null')) continue; // newly created file — not a historical validator

    const addedLines = diff.split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('*'));

    for (const line of addedLines) {
      const extractedPaths = [
        ...line.matchAll(/'([^']+)'/g),
        ...line.matchAll(/`([^`]+)`/g),
      ].map(([, p]) => p);

      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(p => p === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      for (const path of extractedPaths) {
        if (!path.includes('/')) continue;
        if (!phase18cForwardCompatEntries.includes(path)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-18C path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  packageGuard();
  noForbiddenDirectoryChangesGuard();
  backupRestoreRuntimeGuard();
  scopeGuard();
  forbiddenRuntimeFilesGuard();
  forbiddenDependencyGuard();
  docSectionGuard();
  requiredTermGuard('UX plan', requiredUxPlanTerms);
  requiredTermGuard('Phase 18D go/no-go', requiredPhase18DTerms);
  requiredTermGuard('claim boundary', requiredClaimBoundaryTerms);
  forbiddenClaimGuard();
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log('Phase 18C Manual Migration UX Plan validation passed.');
}

validate();
