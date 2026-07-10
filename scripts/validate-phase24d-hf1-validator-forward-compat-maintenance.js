#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';

const RESEARCH = `docs/research/phase24d-hf1-validator-forward-compat-maintenance.md`;
const SUMMARY = `docs/release/phase24d-hf1-validator-forward-compat-summary.md`;
const TOOL = `scripts/register-phase-forward-compat.js`;
const VALIDATOR = `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;
const optionalRegistry = `scripts/validator-forward-compat-registry.json`;
const statusToken = `PHASE24D_HF1_VALIDATOR_FORWARD_COMPAT_MAINTENANCE_STATUS: COMPLETED_TOOLING_ONLY`;
const phasePaths = [RESEARCH, SUMMARY, TOOL, VALIDATOR, optionalRegistry];
const requiredChanged = [RESEARCH, SUMMARY, TOOL, VALIDATOR, WORKFLOW];
const allowedChanged = new Set(requiredChanged);
const exactForwardCompatPaths = phasePaths;

const researchHeadings = [
  `# Phase 24D-HF1 — Validator Forward-Compat Maintenance / Token Cost Reduction`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Problem statement`,
  `## Root cause`,
  `## Safe forward-compat policy`,
  `## Tooling design`,
  `## Dry-run-first workflow`,
  `## Write-mode workflow`,
  `## Rollback plan`,
  `## Validation plan`,
  `## Token reduction policy`,
  `## Future Phase 24E+ workflow`,
  `## What Phase 24D-HF1 can claim`,
  `## What Phase 24D-HF1 must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24D-HF1 — Validator Forward-Compat Maintenance Summary`,
  `## Status token`,
  `## Scope`,
  `## Tooling summary`,
  `## Safe usage workflow`,
  `## Rollback plan`,
  `## Validation summary`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24D-HF1 is tooling/docs/static-validator only.`,
  `Phase 24D-HF1 does not change runtime behavior.`,
  `Phase 24D-HF1 does not modify src, tests, e2e, package files, sw.js, or boot-guard.js.`,
  `Phase 24D-HF1 does not implement adapter-aware backup/export/restore.`,
  `Phase 24D-HF1 does not implement Phase 24E.`,
  `Phase 24D-HF1 does not change backup/export/restore behavior.`,
  `Phase 24D-HF1 does not implement IndexedDB.`,
  `Phase 24D-HF1 does not implement storage migration.`,
  `Phase 24D-HF1 does not add sync, cloud, account, auth, or backend behavior.`,
  `Phase 24D-HF1 does not make Shime BETA_READY.`,
  `Future phases should use scripts/register-phase-forward-compat.js in dry-run mode before hand-editing validators.`,
  `If the tool reports unsupported validator patterns, stop and report the exact blocker instead of ad-hoc patching many validators.`,
  `Historical validator edits must remain exact path entries only.`,
  `No broad allowlists are allowed.`,
  `Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only`,
  `Phase 24E is a separate runtime/data-loss-risk gate.`,
  `Phase 24D-HF1 only improves validator maintenance and does not approve production adapter-aware backup/export/restore.`,
];

const rollbackPlan = [
  `Revert scripts/register-phase-forward-compat.js.`,
  `Revert scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js.`,
  `Revert Phase 24D-HF1 docs.`,
  `Revert CI registration for Phase 24D-HF1.`,
  `Revert only Phase 24D-HF1 exact forward-compat entries from historical validators.`,
  `No runtime data migration or cleanup is required because no runtime behavior changes.`,
];

const validationPlan = [
  `Run npm ci before the full validator chain.`,
  `Run the Phase 24D validator.`,
  `Run the Phase 24D-HF1 validator.`,
  `Run tool dry-run fixture checks.`,
  `Run full scripts/validate-*.js chain once after targeted validators pass.`,
  `Run npm run build.`,
  `Run npm run test:unit.`,
  `Do not rerun the full validator chain after every tiny edit.`,
  `Use short log tails only.`,
  `Stop and create continuation handoff if token falls below 25%.`,
];

const allowedClaims = [
  `A validator forward-compat maintenance workflow exists.`,
  `A dry-run-first forward-compat helper exists.`,
  `The helper rejects broad wildcard allowlists.`,
  `The helper is intended to reduce future validator churn and token cost.`,
  `Runtime behavior is unchanged.`,
];

const forbiddenPositiveClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `production IndexedDB storage exists`,
  `StorageAdapter expansion broadly implemented`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `adapter-aware backup/export/restore implemented`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
  `Phase 24E implemented`,
  `Phase 24E automatically approved`,
  `validator guardrails weakened`,
  `broad validator allowlists are acceptable`,
];

const generatedArtifacts = [`node_modules`, `dist`, `coverage`, `test-results`, `playwright-report`, `FETCH_HEAD`];
const forbiddenPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenFiles = [`package.json`, `package-lock.json`, `sw.js`, `boot-guard.js`];

function fail(message) {
  console.error(`Phase 24D-HF1 validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
}

function runGit(command) {
  try { return execSync(command, { encoding: `utf8`, stdio: [`ignore`, `pipe`, `ignore`] }).trim(); }
  catch { return ``; }
}

function lines(value) {
  return value ? value.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
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

function requireIncludes(file, text, value) {
  if (!text.includes(value)) fail(`${file} missing required text: ${value}`);
}

function validateDocs() {
  for (const [file, headings] of [[RESEARCH, researchHeadings], [SUMMARY, summaryHeadings]]) {
    const text = read(file);
    for (const heading of headings) requireIncludes(file, text, heading);
    requireIncludes(file, text, statusToken);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const item of rollbackPlan) requireIncludes(file, text, item);
    for (const item of validationPlan) requireIncludes(file, text, item);
  }
  const docs = `${read(RESEARCH)}\n${read(SUMMARY)}`;
  for (const claim of allowedClaims) requireIncludes(`Phase 24D-HF1 docs`, docs, claim);
  for (const claim of forbiddenPositiveClaims) {
    const lower = docs.toLowerCase();
    let index = lower.indexOf(claim.toLowerCase());
    while (index !== -1) {
      const context = lower.slice(Math.max(0, index - 90), index + claim.length + 90);
      if (!/does not|not claimed|must not|not claim|is not claimed/.test(context)) fail(`Forbidden positive claim appears unguarded: ${claim}`);
      index = lower.indexOf(claim.toLowerCase(), index + 1);
    }
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24d = `node scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`;
  const hf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;
  if (!workflow.includes(hf1)) fail(`CI does not register Phase 24D-HF1 validator`);
  if (workflow.indexOf(hf1) <= workflow.indexOf(phase24d)) fail(`CI must register Phase 24D-HF1 after Phase 24D`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateToolSource() {
  const tool = read(TOOL);
  for (const needle of [`node:fs`, `node:path`, `--write`, `--dry-run`, `dryRun: true`, `--validators`, `--paths`]) requireIncludes(TOOL, tool, needle);
  for (const needle of [`phaseToCompatName`, `variable=`, `phase24eForwardCompatPaths`]) requireIncludes(TOOL, tool, needle);
  for (const broad of [`docs/**`, `docs/research/**`, `docs/release/**`, `scripts/validate-*.js`, `src/**`, `tests/**`]) requireIncludes(TOOL, tool, broad);
  if (/from ['"]\.\.\/src|from ['"]\.\/src|require\(['"].*src\//.test(tool)) fail(`tool must not import app runtime modules`);
  const importLines = tool.split(/\r?\n/).filter(line => /^\s*import /.test(line));
  for (const line of importLines) {
    if (!/from ['"]node:(fs|path)['"]/.test(line)) fail(`tool must use only Node built-in imports: ${line}`);
  }
}

function makeFixtureDir() {
  const fixtureDir = fs.mkdtempSync(`/tmp/phase24d-hf1-forward-compat-`);
  fs.mkdirSync(`${fixtureDir}/scripts`);
  return fixtureDir;
}

function runToolFixture(fixtureDir, args) {
  return execFileSync(process.execPath, [`${process.cwd()}/${TOOL}`, ...args], { cwd: fixtureDir, encoding: `utf8`, stdio: [`ignore`, `pipe`, `pipe`] });
}

function writeFixture(fixtureDir, name, text) {
  const fixture = `${fixtureDir}/scripts/${name}`;
  fs.writeFileSync(fixture, text);
  return fixture;
}

function validateDryRunFixture() {
  const fixtureDir = makeFixtureDir();
  const before = [
    `const allowedChanged = new Set([`,
    `  // Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)`,
    `  \`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md\`,`,
    `  \`docs/release/phase24d-backup-export-restore-adapter-awareness-summary.md\`,`,
    `  \`scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js\`,`,
    `]);`,
    ``,
  ].join(`\n`);
  const fixture = writeFixture(fixtureDir, `validate-fixture.js`, before);
  const args = [
    `--phase`, `PHASE24D_HF1`,
    `--label`, `Phase 24D-HF1 forward-compat entries (Validator Forward-Compat Maintenance)`,
    `--after-phase`, `Phase 24D`,
    `--paths`, `${RESEARCH},${SUMMARY},${TOOL},${VALIDATOR}`,
    `--validators`, `scripts/validate-fixture.js`,
    `--dry-run`,
  ];
  runToolFixture(fixtureDir, args);
  if (fs.readFileSync(fixture, `utf8`) !== before) fail(`tool dry-run modified fixture`);
}

function validateWriteAndIdempotenceFixture() {
  const fixtureDir = makeFixtureDir();
  const before = [
    `const allowedChanged = new Set([`,
    `  // Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)`,
    `  \`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md\`,`,
    `  \`docs/release/phase24d-backup-export-restore-adapter-awareness-summary.md\`,`,
    `  \`scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js\`,`,
    `]);`,
    ``,
  ].join(`\n`);
  const fixture = writeFixture(fixtureDir, `validate-write-fixture.js`, before);
  const args = [
    `--phase`, `PHASE24D_HF1`,
    `--label`, `Phase 24D-HF1 forward-compat entries (Validator Forward-Compat Maintenance)`,
    `--after-phase`, `Phase 24D`,
    `--paths`, `${RESEARCH},${SUMMARY},${TOOL},${VALIDATOR}`,
    `--validators`, `scripts/validate-write-fixture.js`,
    `--write`,
  ];
  runToolFixture(fixtureDir, args);
  const afterFirstWrite = fs.readFileSync(fixture, `utf8`);
  for (const entry of [RESEARCH, SUMMARY, TOOL, VALIDATOR]) requireIncludes(`write fixture`, afterFirstWrite, entry);
  if (afterFirstWrite === before) fail(`tool write mode did not modify fixture`);
  runToolFixture(fixtureDir, args);
  const afterSecondWrite = fs.readFileSync(fixture, `utf8`);
  if (afterSecondWrite !== afterFirstWrite) fail(`tool second write was not idempotent`);
  for (const entry of [RESEARCH, SUMMARY, TOOL, VALIDATOR]) {
    const count = (afterSecondWrite.match(new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`), `g`)) || []).length;
    if (count !== 1) fail(`tool duplicated exact path in idempotent write fixture: ${entry}`);
  }
}

function validatePhaseDerivedVariableFixture() {
  const fixtureDir = makeFixtureDir();
  const before = [
    `// Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)`,
    `const phase24dForwardCompatPaths = [\`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md\`];`,
    `const allowedChanged = new Set([...phase24dForwardCompatPaths]);`,
    `for (const path of phase24dForwardCompatPaths) allowedChanged.add(path);`,
    ``,
  ].join(`\n`);
  const fixture = writeFixture(fixtureDir, `validate-phase24e-fixture.js`, before);
  runToolFixture(fixtureDir, [
    `--phase`, `PHASE24E`,
    `--label`, `Phase 24E forward-compat entries`,
    `--after-phase`, `Phase 24D`,
    `--paths`, `docs/research/phase24e-example.md,scripts/validate-phase24e-example.js`,
    `--validators`, `scripts/validate-phase24e-fixture.js`,
    `--write`,
  ]);
  const after = fs.readFileSync(fixture, `utf8`);
  requireIncludes(`Phase 24E fixture`, after, `phase24eForwardCompatPaths`);
  if (after.includes(`phase24dHf1ForwardCompatPaths`)) fail(`Phase 24E fixture used Phase 24D-HF1 variable name`);
}

function validateRejectedPathFixture() {
  const fixtureDir = makeFixtureDir();
  writeFixture(fixtureDir, `validate-reject-fixture.js`, [
    `const allowedChanged = new Set([`,
    `  // Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)`,
    `  \`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md\`,`,
    `]);`,
    ``,
  ].join(`\n`));
  let rejected = false;
  try {
    runToolFixture(fixtureDir, [
      `--phase`, `PHASE24D_HF1`,
      `--label`, `Phase 24D-HF1 forward-compat entries (Validator Forward-Compat Maintenance)`,
      `--after-phase`, `Phase 24D`,
      `--paths`, `docs/**`,
      `--validators`, `scripts/validate-reject-fixture.js`,
    ]);
  } catch {
    rejected = true;
  }
  if (!rejected) fail(`tool did not reject wildcard fixture path`);
}

function validateUnsupportedPatternFixture() {
  const fixtureDir = makeFixtureDir();
  const before = [
    `// Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)`,
    `registerForwardCompat(\`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md\`);`,
    ``,
  ].join(`\n`);
  const fixture = writeFixture(fixtureDir, `validate-unsupported-fixture.js`, before);
  let rejected = false;
  try {
    runToolFixture(fixtureDir, [
      `--phase`, `PHASE24E`,
      `--label`, `Phase 24E forward-compat entries`,
      `--after-phase`, `Phase 24D`,
      `--paths`, `docs/research/phase24e-example.md`,
      `--validators`, `scripts/validate-unsupported-fixture.js`,
      `--write`,
    ]);
  } catch {
    rejected = true;
  }
  if (!rejected) fail(`tool did not reject unsupported validator pattern`);
  if (fs.readFileSync(fixture, `utf8`) !== before) fail(`tool modified unsupported validator pattern fixture`);
}

function validateToolFixtures() {
  validateDryRunFixture();
  validateWriteAndIdempotenceFixture();
  validatePhaseDerivedVariableFixture();
  validateRejectedPathFixture();
  validateUnsupportedPatternFixture();
}

function validateChangedScope() {
  const files = changedFiles();
  for (const file of requiredChanged) if (!files.includes(file)) fail(`Required changed file is missing: ${file}`);
  for (const file of files) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) fail(`Generated artifact present: ${file}`);
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (allowedChanged.has(file)) continue;
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    fail(`Unexpected changed file: ${file}`);
  }
}

function validateHistoricalValidatorDiffs() {
  const historical = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR && file !== `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`);
  for (const file of historical) {
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      if (line.includes(`Phase 24D-HF1 forward-compat entries`)) continue;
      if (line.includes(`phase24dHf1ForwardCompatPaths`)) continue;
      if (line.includes(`isPhase24dHf1ForwardCompat`)) continue;
      if (line.includes(`isPhase24dHf1GuardLogic`)) continue;
      if (line.includes(`isPhase24dHf1OnlyForwardCompat`)) continue;
      if (line.includes(`requiredForwardCompatPaths`)) continue;
      if (line.includes(`forwardCompatPath`)) continue;
      if (line.includes(`Phase 24D-HF1`)) continue;
      const hasExactPath = exactForwardCompatPaths.some(entry => line.includes(entry));
      if (!hasExactPath) fail(`${file} has non-Phase 24D-HF1 forward-compat addition: ${line}`);
      if (/docs\/\*\*|docs\/research\/\*\*|docs\/release\/\*\*|scripts\/validate-\*\.js|src\/\*\*|tests\/\*\*/.test(line)) {
        fail(`${file} contains broad forward-compat allowlist: ${line}`);
      }
    }
  }
}

function validateRegistry() {
  if (!fs.existsSync(optionalRegistry)) return;
  const registry = JSON.parse(read(optionalRegistry));
  const text = JSON.stringify(registry);
  if (/\*\*|\*\.js|src\/|tests\//.test(text)) fail(`optional registry contains broad or forbidden paths`);
}

for (const file of [RESEARCH, SUMMARY, TOOL, VALIDATOR]) read(file);
validateDocs();
validateWorkflow();
validateToolSource();
validateToolFixtures();
validateChangedScope();
validateHistoricalValidatorDiffs();
validateRegistry();

console.log(`Phase 24D-HF1 validator forward-compat maintenance validation passed.`);
