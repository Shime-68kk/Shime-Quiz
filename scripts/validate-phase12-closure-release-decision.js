#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const requiredFiles = ['docs/phase12-closure-release-decision.md','docs/phase12-roadmap-risk-register.md','docs/study-flow-micro-feedback-runtime.md','README.md','RELEASE_QA_V2.md','docs/public-release-notes.md','docs/deployment-readiness.md','.github/workflows/e2e-smoke.yml','scripts/validate-phase12-closure-release-decision.js'];
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

  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's existing scope guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
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
  // Phase 14K exact files (forward compatibility)
  'docs/phase14k-fsrs-readiness-audit.md',
  'scripts/validate-phase14k-fsrs-readiness-audit.js',
]);
const forbiddenFiles = ['package.json','package-lock.json','vite.config.js','vite.config.mjs','playwright.config.js'];
const forbiddenPrefixes = ['src/','e2e/','tests/','__tests__/'];
const generatedArtifacts = ['node_modules','dist','test-results','playwright-report','coverage','FETCH_HEAD'];
const internalRegistryTerms = ['applied-caas','artifactory','internal.api.openai','packages.applied'];
function fail(message){console.error(`Phase 12J validation failed: ${message}`);process.exit(1)}
function warn(message){console.warn(`Phase 12J validation warning: ${message}`)}
function read(file){if(!fs.existsSync(file))fail(`Missing required file: ${file}`);return fs.readFileSync(file,'utf8')}
function normalize(text){return String(text).toLowerCase().replace(/[“”`*_()[\]/]+/g,' ').replace(/[\u2010-\u2015]/g,'-').replace(/\s+/g,' ').trim()}
function requireIncludes(file,terms){const text=normalize(read(file));for(const term of terms){if(!text.includes(normalize(term)))fail(`${file} must mention: ${term}`)}}
function requireAny(file,label,patterns){const text=normalize(read(file));if(!patterns.some(pattern=>text.includes(normalize(pattern))))fail(`${file} must mention ${label}; accepted wording: ${patterns.join(' | ')}`)}
function runGit(command,options={}){try{return execSync(command,{encoding:'utf8',stdio:['ignore','pipe','pipe'],...options}).trim()}catch{if(!options.silent)warn(`Git command failed; scope check may be limited: ${command}`);return ''}}
function splitLines(output){return output?output.split(/\r?\n/).map(line=>line.trim()).filter(Boolean):[]}
function uniqueSorted(files){return [...new Set(files)].sort((a,b)=>a.localeCompare(b))}
function changedFilesFromPullRequestBase(){const baseRef=process.env.GITHUB_BASE_REF;if(!baseRef)return[];runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`,{silent:true});const mergeBase=runGit(`git merge-base HEAD origin/${baseRef}`,{silent:true});if(!mergeBase)return[];return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`,{silent:true}))}
function changedFilesFromLocalFallbacks({includeUntracked=true}={}){const files=[...splitLines(runGit('git diff --name-only HEAD',{silent:true})),...splitLines(runGit('git diff --cached --name-only',{silent:true}))];if(includeUntracked)files.push(...splitLines(runGit('git ls-files --others --exclude-standard',{silent:true})));return files}
function changedFiles({includeUntracked=true}={}){const prFiles=changedFilesFromPullRequestBase();if(prFiles.length>0)return uniqueSorted(prFiles);return uniqueSorted(changedFilesFromLocalFallbacks({includeUntracked}))}
function trackedFiles(){return uniqueSorted(splitLines(runGit('git ls-files',{silent:true})))}
function scopeGuard(){for(const file of changedFiles()){if(generatedArtifacts.some(artifact=>file===artifact||file.startsWith(`${artifact}/`)))continue;if(allowedChangedFiles.has(file))continue;if(forbiddenFiles.includes(file))fail(`Forbidden file changed in Phase 12J: ${file}`);if(forbiddenPrefixes.some(prefix=>file.startsWith(prefix)))fail(`Forbidden path changed in Phase 12J: ${file}`);if(file.startsWith('scripts/validate-'))fail(`Unexpected validator changed in Phase 12J: ${file}`);fail(`Unexpected changed file for Phase 12J: ${file}`)}}
function generatedArtifactGuard(){const files=uniqueSorted([...changedFiles({includeUntracked:false}),...trackedFiles()]);for(const artifact of generatedArtifacts){if(files.some(file=>file===artifact||file.startsWith(`${artifact}/`)))fail(`Generated artifact appears in changed or tracked files: ${artifact}`)}}
function packageRegistryGuard(){for(const file of ['package.json','package-lock.json']){const text=read(file);for(const term of internalRegistryTerms){if(text.includes(term))fail(`Internal registry marker found in ${file}: ${term}`)}}}
function workflowGuard(){const workflow=read('.github/workflows/e2e-smoke.yml');const required=['npm run test:unit','node scripts/validate-study-flow-micro-feedback-runtime.js','node scripts/validate-phase12-closure-release-decision.js','node scripts/validate-vitest-unit-test-foundation.js','npm run test:e2e:smoke','npm run test:e2e:onboarding','actions/upload-artifact'];for(const term of required)if(!workflow.includes(term))fail(`Workflow missing required check: ${term}`);if(workflow.includes('continue-on-error: true'))fail('Workflow must not add broad continue-on-error.')}
function docsGuard(){requireIncludes('docs/phase12-closure-release-decision.md',['Phase 12J','Phase 12 Closure / Release Decision','Phase 12A','Phase 12I','Phase 13','handoff','local-first','browser-local','release package','release tag','GitHub Release','not created by Phase 12J','No runtime behavior changed by Phase 12J']);requireAny('docs/phase12-closure-release-decision.md','release execution remains separate',['release execution still requires a separate explicit user-approved release step','separate final release process may begin after explicit user approval']);requireIncludes('README.md',['docs/phase12-closure-release-decision.md','Phase 12J','Phase 12 is closed']);requireIncludes('RELEASE_QA_V2.md',['Phase 12J','Phase 12 Closure / Release Decision','No runtime behavior changed by Phase 12J']);requireIncludes('docs/phase12-roadmap-risk-register.md',['Phase 12J','Phase 12 Closure / Release Decision','Phase 12 is closed']);requireIncludes('docs/public-release-notes.md',['Phase 12J','Phase 12 closure','No release package']);requireIncludes('docs/deployment-readiness.md',['Phase 12J','does not change deployment requirements','no backend/cloud/account sync'])}
function claimsGuard(){const claimFiles=['README.md','RELEASE_QA_V2.md','docs/phase12-closure-release-decision.md','docs/public-release-notes.md','docs/deployment-readiness.md'];const forbidden=['release package created','release tag created','GitHub Release published','production certified','security certified','accessibility certified','performance certified','FSRS implemented','IndexedDB implemented','cloud/account sync implemented','route-level code splitting implemented'];const safeMarkers=['not ','no ','does not','do not','has not','not created','not published','future','separate','unless','forbidden','do not claim','not implemented'];for(const file of claimFiles){for(const line of read(file).split(/\r?\n/)){const normalizedLine=normalize(line);for(const phrase of forbidden){if(normalizedLine.includes(normalize(phrase))&&!safeMarkers.some(marker=>normalizedLine.includes(normalize(marker))))fail(`Unsupported overclaim in ${file}: ${line.trim()}`)}}}}
function validate(){for(const file of requiredFiles)read(file);docsGuard();workflowGuard();scopeGuard();generatedArtifactGuard();packageRegistryGuard();claimsGuard();console.log('Phase 12J Closure / Release Decision validation passed.')}
validate();
