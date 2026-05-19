#!/usr/bin/env node
/**
 * Phase 22F static validator - actual stress run with larger import / quota / backup rehearsal.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE = `docs/testing/phase22f-actual-stress-run.md`;
const SUMMARY = `docs/release/phase22f-actual-stress-summary.md`;
const VALIDATOR = `scripts/validate-phase22f-actual-stress-run.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase22fPaths = [EVIDENCE, SUMMARY, VALIDATOR];
const allowedChanged = new Set([WORKFLOW, ...phase22fPaths]);
const phase22fForwardCompatPaths = new Set(phase22fPaths);
allowedChanged.add(`docs/testing/phase22g-filled-evidence-update.md`);
allowedChanged.add(`docs/release/phase22g-filled-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22g-filled-evidence-update.js`);
allowedChanged.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
allowedChanged.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
allowedChanged.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
allowedChanged.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
allowedChanged.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
allowedChanged.add(`scripts/validate-phase23a-local-data-survival-research.js`);
phase22fForwardCompatPaths.add(`docs/testing/phase22g-filled-evidence-update.md`);
phase22fForwardCompatPaths.add(`docs/release/phase22g-filled-evidence-summary.md`);
phase22fForwardCompatPaths.add(`scripts/validate-phase22g-filled-evidence-update.js`);
phase22fForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase22fForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase22fForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase22fForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase22fForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase22fForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);

const evidenceHeadings = [
  `# Phase 22F — Actual Stress Run With Larger Import / Quota / Backup Rehearsal`,
  `## Status tokens`,
  `## Environment and baseline`,
  `## Generated/test data policy`,
  `## Stress scenario table`,
  `## Executed stress observations`,
  `## Blocked, unsupported, unavailable, or not-tested stress scenarios`,
  `## Evidence interpretation`,
  `## Guardrails`,
  `## Remaining gaps`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 22F — Actual Stress Run Summary`,
  `## Status tokens`,
  `## Scope`,
  `## Stress evidence summary`,
  `## What Phase 22F can claim`,
  `## What Phase 22F must not claim`,
  `## Remaining evidence gaps`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredCategories = [
  `larger import stress`,
  `large CSV import stress`,
  `large text or Markdown import stress`,
  `storage quota or large import warning`,
  `backup before restore rehearsal`,
  `repeated backup before restore rehearsal`,
  `restore preview or overwrite confirmation`,
  `restore completion with disposable/generated data`,
  `post-import app stability`,
  `manual export or transfer rehearsal`,
  `mobile viewport stress-adjacent check`,
  `remaining gaps after stress run`,
];

const statusValues = [`EXECUTED_WITH_ANONYMIZED_RESULTS`, `BLOCKED_BY_ENVIRONMENT`];
const rowStatuses = new Set([`PASS`, `FAIL`, `BLOCKED`, `NOT_TESTED`, `UNSUPPORTED`, `UNAVAILABLE`]);
const tableHeader = `| Scenario ID | Stress category | Data shape | Expected safety boundary | Observed result | Status | Notes |`;

const forbiddenPositiveClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `broad external real-user testing complete`,
  `full production stress testing complete`,
  `production readiness`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `guaranteed data-loss prevention`,
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
const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `coverage`,
  `test-results`,
  `playwright-report`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
  `phase22f-actual-stress-run.patch`,
  `phase22f-actual-stress-run.zip`,
  `phase22f-actual-stress-run-handoff.md`,
];

function fail(message) {
  console.error(`Phase 22F validation failed: ${message}`);
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

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase22e = `node scripts/validate-phase22e-broader-manual-evidence.js`;
  const phase22f = `node scripts/validate-phase22f-actual-stress-run.js`;
  if (!workflow.includes(phase22f)) fail(`CI does not register Phase 22F validator`);
  if (workflow.indexOf(phase22f) <= workflow.indexOf(phase22e)) fail(`CI must register Phase 22F after Phase 22E`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function parseStatusAndCount(file) {
  const text = read(file);
  const statusMatches = [...text.matchAll(/PHASE22F_ACTUAL_STRESS_RUN_STATUS:\s*([A-Z_]+)/g)];
  if (statusMatches.length !== 1) fail(`${file} must contain exactly one Phase 22F status token`);
  const status = statusMatches[0][1];
  if (!statusValues.includes(status)) fail(`${file} has invalid Phase 22F status: ${status}`);

  const countMatches = [...text.matchAll(/PHASE22F_ACTUAL_STRESS_SCENARIOS_RECORDED:\s*([0-9]+(?:\.[0-9]+)?)/g)];
  if (countMatches.length !== 1) fail(`${file} must contain exactly one stress scenario count token`);
  const count = Number(countMatches[0][1]);
  if (!Number.isFinite(count)) fail(`${file} stress scenario count is not parseable`);
  return { status, count };
}

function parseScenarioRows() {
  const text = read(EVIDENCE);
  const headerIndex = text.indexOf(tableHeader);
  if (headerIndex === -1) fail(`Stress scenario table header is missing or does not match required columns`);
  const tableText = text.slice(headerIndex).split(/\n\n/)[0];
  const rows = tableText.split(/\r?\n/).filter(line => line.startsWith(`|`));
  if (rows.length < 3) fail(`Stress scenario table must include header, separator, and data rows`);
  const dataRows = rows.slice(2).filter(line => !/^\|\s*-+/.test(line));
  return dataRows.map((line, index) => {
    const cells = line.split(`|`).slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 7) fail(`Stress scenario table row ${index + 1} must have 7 cells`);
    const [id, category, dataShape, boundary, observed, status, notes] = cells;
    if (!rowStatuses.has(status)) fail(`Stress scenario table row ${id || index + 1} has invalid status: ${status}`);
    return { id, category, dataShape, boundary, observed, status, notes, line };
  });
}

function validateScenarioTable(status, count) {
  const rows = parseScenarioRows();
  if (rows.length !== count) fail(`Stress scenario table row count ${rows.length} does not match token count ${count}`);
  if (status === `EXECUTED_WITH_ANONYMIZED_RESULTS` && count <= 0) fail(`Executed status requires stress scenario count greater than 0`);
  if (status === `BLOCKED_BY_ENVIRONMENT`) {
    const text = normalize(read(EVIDENCE)).toLowerCase();
    if (!/blocked explanation|blocked by environment|environment blocked/.test(text)) fail(`Blocked status requires blocked explanation`);
    if (/executed stress observations.*pass/i.test(text)) fail(`Blocked status must not claim executed stress observations`);
  }
  for (const row of rows) {
    if (row.status !== `PASS` && /\bPASS\b/i.test(row.observed)) {
      fail(`Non-PASS stress scenario must not describe observed result as PASS: ${row.id}`);
    }
  }
}

function validateRequiredCategories() {
  const docs = `${read(EVIDENCE)}\n${read(SUMMARY)}`;
  const lowerDocs = docs.toLowerCase();
  for (const category of requiredCategories) {
    if (!lowerDocs.includes(category.toLowerCase())) fail(`Docs missing required stress category: ${category}`);
  }
  const rows = parseScenarioRows();
  const rowCategories = rows.map(row => row.category.toLowerCase());
  for (const category of requiredCategories) {
    if (!rowCategories.includes(category.toLowerCase())) fail(`Stress scenario table missing required category row: ${category}`);
  }
}

function validateForbiddenClaims() {
  const docs = `${read(EVIDENCE)}\n${read(SUMMARY)}`;
  const combined = normalize(docs).toLowerCase();
  for (const claim of forbiddenPositiveClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 240), index + needle.length + 240);
      const guarded = /does not|do not|must not|not claim|not claimed|remaining gaps|guardrails|absence|zero|no `beta-ai`|no phase 22f/.test(context);
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
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) fail(`Unexpected changed file: ${file}`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    const removedLines = diff.split(/\r?\n/)
      .filter(line => line.startsWith(`-`) && !line.startsWith(`---`))
      .map(line => line.slice(1).trim());
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase22fForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22F forward-compat addition: ${line}`);
      }
      for (const path of phase22fForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22F path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase22fPaths) read(file);
requireHeadings(EVIDENCE, evidenceHeadings);
requireHeadings(SUMMARY, summaryHeadings);
validateWorkflow();
const evidenceStatus = parseStatusAndCount(EVIDENCE);
const summaryStatus = parseStatusAndCount(SUMMARY);
if (evidenceStatus.status !== summaryStatus.status) fail(`Status tokens differ between docs`);
if (evidenceStatus.count !== summaryStatus.count) fail(`Stress scenario count tokens differ between docs`);
validateScenarioTable(evidenceStatus.status, evidenceStatus.count);
validateRequiredCategories();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();

console.log(`Phase 22F actual stress run validation passed.`);
