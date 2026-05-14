import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/unit-test-foundation-plan.md',
  'docs/phase12-roadmap-risk-register.md',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
];
const allowedChangedFiles = new Set([
  // Phase 14B compatibility: allow only the approved internal/test-only
  // FSRS wrapper prototype files and exact ts-fsrs package metadata.
  'package.json',
  'package-lock.json',
  'docs/phase14b-fsrs-wrapper-test-prototype.md',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'src/quiz/fsrsWrapper.js',
  'tests/unit/fsrsWrapper.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14C compatibility: allow only the approved FSRS persistence
  // backup harness files while preserving older phase guardrails.
  'docs/phase14c-fsrs-persistence-backup-harness.md',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/fsrsPersistenceHarness.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14D compatibility: allow only the approved developer-gated
  // FSRS adapter routing files while preserving older phase guardrails.
  'docs/phase14f-fsrs-experimental-toggle-plan.md',
  'scripts/validate-phase14f-toggle-plan.js',
  'docs/phase14e-fsrs-user-facing-entry-decision.md',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'docs/phase14d-developer-gated-fsrs-adapter-routing.md',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14A compatibility: allow only the approved scheduler adapter
  // boundary scaffolding files while preserving older phase guardrails.
  'docs/phase14a-scheduler-adapter-boundary.md',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13D compatibility: allow only the approved FSRS entry
  // decision docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-closure-fsrs-entry-decision.md',
  'docs/phase14-fsrs-implementation-scope.md',
  'docs/phase14-risk-and-validation-plan.md',
  'scripts/validate-phase13-closure.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13C compatibility: allow only the approved local adaptive
  // learning roadmap docs/static-validator files while preserving older
  // phase guardrails.
  'docs/phase13-local-adaptive-learning-roadmap.md',
  'docs/phase13-intelligence-layer-boundaries.md',
  'docs/phase13-phase14-plus-roadmap.md',
  'scripts/validate-phase13-local-adaptive-roadmap.js',

  // Phase 13B compatibility: allow only the approved FSRS migration
  // architecture docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',

  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',

  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/phase12-closure-release-decision.md',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  // Phase 14F-HF1 compatibility — exact files only
  'package.json',
  'package-lock.json',
  'scripts/validate-v2-release-hardening.js',
  'docs/phase14f-hf1-baseline-validation-recovery.md',
  'scripts/validate-phase14f-hf1-baseline-validation-recovery.js',
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase13-closure.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'scripts/validate-phase14f-toggle-plan.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
  // Phase 14G compatibility — exact files only
  'docs/phase14g-fsrs-settings-storage-schema.md',
  'scripts/validate-phase14g-settings-storage.js',
  'src/state/settingsStorage.js',
  'src/state/localStorageSync.js',
  'src/state/v2BackupRestore.js',
  'tests/unit/settingsStorage.test.js',
  'tests/unit/backupSettingsPersistence.test.js',
  // Phase 14H compatibility — exact files only
  'docs/phase14h-fsrs-experimental-toggle-ui.md',
  'scripts/validate-phase14h-fsrs-toggle-ui.js',
  'src/routes/Settings.jsx',
  'src/routes/routeConfig.js',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
  'tests/unit/fsrsExperimentalSettingsPanel.test.jsx',
  // Phase 14I compatibility — exact files only
  'docs/phase14i-fsrs-two-step-rating-ui-fixture.md',
  'scripts/validate-phase14i-fsrs-two-step-fixture.js',
  'src/components/study/FsrsTwoStepScaffold.jsx',
  'src/routes/FsrsUiFixture.jsx',
  'tests/unit/fsrsTwoStepScaffold.test.jsx',
  // Phase 14J compatibility — exact files only
  'src/quiz/reviewSchedulerAdapter.js',
  'docs/phase14j-fsrs-enrollment-readiness-harness.md',
  'scripts/validate-phase14j-fsrs-enrollment-readiness.js',
  'tests/unit/fsrsEnrollmentReadinessHarness.test.js',
]);
const forbiddenChangedFiles = ['package.json','package-lock.json','vite.config','vite.config.js','vite.config.mjs','playwright.config','playwright.config.js'];
const forbiddenChangedPrefixes = ['src/','e2e/','tests/','__tests__/'];
const generatedArtifacts = ['node_modules','dist','test-results','playwright-report','coverage','FETCH_HEAD'];
const publicClaimFiles = ['README.md','RELEASE_QA_V2.md','docs/unit-test-foundation-plan.md','docs/phase12-roadmap-risk-register.md','docs/public-release-notes.md','docs/deployment-readiness.md'];
function fail(message){ console.error(`Phase 12F validation failed: ${message}`); process.exit(1); }
function warn(message){ console.warn(`Phase 12F validation warning: ${message}`); }
function read(file){ if(!fs.existsSync(file)) fail(`Missing required file: ${file}`); return fs.readFileSync(file,'utf8'); }
function normalize(text){ return String(text).toLowerCase().replace(/[`*_()[\]\/]+/g,' ').replace(/[\u2010-\u2015]/g,'-').replace(/[“”]/g,'"').replace(/\s+/g,' ').trim(); }
function requireIncludes(file, terms){ const text=normalize(read(file)); for(const term of terms){ if(!text.includes(normalize(term))) fail(`${file} must mention: ${term}`); } }
function requireAny(file,label,patterns){ const text=normalize(read(file)); if(!patterns.some((p)=>text.includes(normalize(p)))) fail(`${file} must mention ${label}; accepted wording: ${patterns.join(' | ')}`); }
function runGit(command, options={}){ try { return execSync(command,{encoding:'utf8',stdio:['ignore','pipe','pipe'],...options}).trim(); } catch { if(!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`); return ''; } }
function splitLines(output){ return output ? output.split(/\r?\n/).map((line)=>line.trim()).filter(Boolean) : []; }
function uniqueSorted(files){ return [...new Set(files)].sort((a,b)=>a.localeCompare(b)); }
function changedFilesFromPullRequestBase(){ const baseRef=process.env.GITHUB_BASE_REF; if(!baseRef) return []; runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`,{silent:true}); const mergeBase=runGit(`git merge-base HEAD origin/${baseRef}`,{silent:true}); if(!mergeBase){ warn(`Could not compute merge base against origin/${baseRef}; falling back to local changed-file detection.`); return []; } return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`,{silent:true})); }
function changedFilesFromLocalFallbacks({includeUntracked=true}={}){ const files=[...splitLines(runGit('git diff --name-only HEAD',{silent:true})),...splitLines(runGit('git diff --cached --name-only',{silent:true}))]; if(includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard',{silent:true}))); if(files.length===0 && !runGit('git rev-parse --is-inside-work-tree',{silent:true})) warn('Git is unavailable; changed-file scope checks are limited to content checks.'); return files; }
function changedFiles({includeUntracked=true}={}){ const prBaseFiles=changedFilesFromPullRequestBase(); if(prBaseFiles.length>0) return uniqueSorted(prBaseFiles); return uniqueSorted(changedFilesFromLocalFallbacks({includeUntracked})); }
function trackedFiles(){ return uniqueSorted(splitLines(runGit('git ls-files',{silent:true}))); }
function scopeGuard(){ const changed=changedFiles(); for(const file of changed){ if(generatedArtifacts.some((a)=>file===a||file.startsWith(`${a}/`))) continue; if(forbiddenChangedFiles.includes(file) && !allowedChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`); if(forbiddenChangedPrefixes.some((p)=>file.startsWith(p)) && !allowedChangedFiles.has(file)) fail(`Forbidden path changed: ${file}`); if(!allowedChangedFiles.has(file)) fail(`Unexpected changed file for Phase 12F scope: ${file}`); } }
function generatedArtifactGuard(){ const files=uniqueSorted([...changedFiles({includeUntracked:false}),...trackedFiles()]); for(const artifact of generatedArtifacts){ if(files.some((file)=>file===artifact||file.startsWith(`${artifact}/`))) fail(`Generated artifact appears in changed or tracked files: ${artifact}`); } }
function lineIsSafe(line){ const safeMarkers=['not added','not implemented','not changed','not change','not created','not published','planned','future','non-goal','non-goals','forbidden claim','forbidden claims','does not','do not','no ','without','unchanged','remains','preserve','requirements','should not','must not','only if approved','candidate','strategy','expectations']; const normalized=normalize(line); return safeMarkers.some((m)=>normalized.includes(normalize(m))); }
function forbiddenOverclaimGuard(){ const phrases=['coverage added','test script added','package dependencies changed','package version changed','algorithms changed','FSRS implemented','IndexedDB implemented','release package created','release tag created','GitHub Release published']; for(const file of publicClaimFiles){ const lines=read(file).split(/\r?\n/); let inForbiddenSection=false; for(const line of lines){ const normalizedLine=normalize(line); if(normalizedLine.includes('forbidden')) inForbiddenSection=true; else if(/^##\s+/.test(line)&&inForbiddenSection) inForbiddenSection=false; if(inForbiddenSection) continue; for(const phrase of phrases){ if(normalizedLine.includes(normalize(phrase))&&!lineIsSafe(line)) fail(`Unsupported positive overclaim in ${file}: ${line.trim()}`); } } } }
function validate(){
  for(const file of requiredFiles) read(file);
  requireIncludes('docs/unit-test-foundation-plan.md',['Phase 12F','Unit Test Foundation Plan','completed/merged through Phase 12E','Vitest','unit tests','candidate test targets','spaced repetition','mastery','weighted selection','parser','import validation','backup validation','storage quota helper','Dashboard Today Card','CI expectations','non-goals','allowed claims','forbidden claims','Phase 12G','Vitest Unit Test Foundation']);
  requireAny('docs/unit-test-foundation-plan.md','Vitest not added by Phase 12F',['Phase 12F does not add Vitest','Vitest is not added by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','unit tests not added by Phase 12F',['Phase 12F does not add unit tests','unit tests are not added by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','test scripts not added by Phase 12F',['does not add test scripts','test scripts are not added by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','coverage tooling not added by Phase 12F',['does not add coverage tooling','coverage tooling is not added by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','package dependencies not changed by Phase 12F',['No package/dependency changes were made by Phase 12F','package dependencies are not changed by Phase 12F','does not add dependencies']);
  requireAny('docs/unit-test-foundation-plan.md','package.json not changed by Phase 12F',['does not change package.json','package.json is not changed by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','package-lock.json not changed by Phase 12F',['does not change package-lock.json','package-lock.json is not changed by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','runtime app behavior not changed by Phase 12F',['does not change runtime app behavior','runtime app behavior is not changed by Phase 12F']);
  requireAny('docs/unit-test-foundation-plan.md','algorithms not changed by Phase 12F',['does not change algorithms','algorithms are not changed by Phase 12F']);
  requireIncludes('README.md',['docs/unit-test-foundation-plan.md','Unit Test Foundation Plan']);
  requireAny('README.md','Vitest/tests not added or planned for future',['does not add Vitest, does not add unit tests','Vitest/tests are not added']);
  requireAny('README.md','package/dependencies unchanged',['does not change package/dependencies','package/dependencies are unchanged']);
  requireIncludes('RELEASE_QA_V2.md',['Phase 12F','Unit Test Foundation Plan','no runtime app behavior changes','no `src/` changes','no tests added','no Vitest added','no package version/dependency changes','no algorithm changes']);
  requireIncludes('docs/phase12-roadmap-risk-register.md',['Phase 12F','Unit Test Foundation','Phase 12G','Vitest Unit Test Foundation']);
  requireIncludes('docs/public-release-notes.md',['unit test foundation planning']);
  requireAny('docs/deployment-readiness.md','unit test foundation planning or no deployment requirement change',['Unit Test Foundation planning does not change deployment requirements','unit test foundation planning']);
  requireIncludes('docs/deployment-readiness.md',['local-first','no backend','cloud','account sync']);
  requireIncludes('.github/workflows/e2e-smoke.yml',['node scripts/validate-unit-test-foundation-plan.js']);
  scopeGuard(); generatedArtifactGuard(); forbiddenOverclaimGuard();
  console.log('Phase 12F Unit Test Foundation Plan validation passed.');
}
validate();
