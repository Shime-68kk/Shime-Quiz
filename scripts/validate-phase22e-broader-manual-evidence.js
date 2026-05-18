#!/usr/bin/env node
/**
 * Phase 22E static validator - broader manual evidence with larger import coverage.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE = `docs/testing/phase22e-broader-manual-evidence-run.md`;
const SUMMARY = `docs/release/phase22e-broader-manual-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase22e-broader-manual-evidence.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase22ePaths = [EVIDENCE, SUMMARY, VALIDATOR];
const allowedChanged = new Set([WORKFLOW, ...phase22ePaths]);
const phase22eForwardCompatPaths = new Set(phase22ePaths);

const evidenceHeadings = [
  `# Phase 22E — Broader Manual Evidence Run With Larger Import Coverage`,
  `## Status tokens`,
  `## Environment and baseline`,
  `## Generated/test data policy`,
  `## Scenario table`,
  `## Executed observations`,
  `## Blocked, unsupported, unavailable, or not-tested scenarios`,
  `## Evidence interpretation`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 22E — Broader Manual Evidence Summary`,
  `## Status tokens`,
  `## Scope`,
  `## Evidence summary`,
  `## What Phase 22E can claim`,
  `## What Phase 22E must not claim`,
  `## Remaining evidence gaps`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredCategories = [
  `larger import`,
  `CSV import`,
  `text or Markdown import`,
  `storage quota or large import warning`,
  `backup before restore`,
  `restore preview or overwrite confirmation`,
  `manual transfer`,
  `mobile viewport`,
  `no-cloud default-off`,
  `FSRS boundary`,
  `EduGen boundary`,
  `beta-ai naming absence`,
];

const statusValues = [`EXECUTED_WITH_ANONYMIZED_RESULTS`, `BLOCKED_BY_ENVIRONMENT`];
const rowStatuses = new Set([`PASS`, `FAIL`, `BLOCKED`, `NOT_TESTED`, `UNSUPPORTED`, `UNAVAILABLE`]);
const tableHeader = `| Scenario ID | Scenario category | Data type | Expected safety boundary | Observed result | Status | Notes |`;

const forbiddenPositiveClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `broad external real-user testing complete`,
  `full stress testing complete`,
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
  `phase22e-broader-manual-evidence.patch`,
  `phase22e-broader-manual-evidence.zip`,
  `phase22e-broader-manual-evidence-handoff.md`,
];

function fail(message) {
  console.error(`Phase 22E validation failed: ${message}`);
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
  const phase22d = `node scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`;
  const phase22e = `node scripts/validate-phase22e-broader-manual-evidence.js`;
  if (!workflow.includes(phase22e)) fail(`CI does not register Phase 22E validator`);
  if (workflow.indexOf(phase22e) <= workflow.indexOf(phase22d)) fail(`CI must register Phase 22E after Phase 22D`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function parseStatusAndCount(file) {
  const text = read(file);
  const statusMatches = [...text.matchAll(/PHASE22E_BROADER_MANUAL_EVIDENCE_STATUS:\s*([A-Z_]+)/g)];
  if (statusMatches.length !== 1) fail(`${file} must contain exactly one Phase 22E status token`);
  const status = statusMatches[0][1];
  if (!statusValues.includes(status)) fail(`${file} has invalid Phase 22E status: ${status}`);

  const countMatches = [...text.matchAll(/PHASE22E_BROADER_MANUAL_EVIDENCE_SCENARIOS_RECORDED:\s*([0-9]+(?:\.[0-9]+)?)/g)];
  if (countMatches.length !== 1) fail(`${file} must contain exactly one scenario count token`);
  const count = Number(countMatches[0][1]);
  if (!Number.isFinite(count)) fail(`${file} scenario count is not parseable`);
  return { status, count };
}

function parseScenarioRows() {
  const text = read(EVIDENCE);
  const headerIndex = text.indexOf(tableHeader);
  if (headerIndex === -1) fail(`Scenario table header is missing or does not match required columns`);
  const tableText = text.slice(headerIndex).split(/\n\n/)[0];
  const rows = tableText.split(/\r?\n/).filter(line => line.startsWith(`|`));
  if (rows.length < 3) fail(`Scenario table must include header, separator, and data rows`);
  const dataRows = rows.slice(2).filter(line => !/^\|\s*-+/.test(line));
  return dataRows.map((line, index) => {
    const cells = line.split(`|`).slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 7) fail(`Scenario table row ${index + 1} must have 7 cells`);
    const [id, category, dataType, boundary, observed, status, notes] = cells;
    if (!rowStatuses.has(status)) fail(`Scenario table row ${id || index + 1} has invalid status: ${status}`);
    return { id, category, dataType, boundary, observed, status, notes, line };
  });
}

function validateScenarioTable(status, count) {
  const rows = parseScenarioRows();
  if (rows.length !== count) fail(`Scenario table row count ${rows.length} does not match token count ${count}`);
  if (status === `EXECUTED_WITH_ANONYMIZED_RESULTS` && count <= 0) fail(`Executed status requires scenario count greater than 0`);
  if (status === `BLOCKED_BY_ENVIRONMENT`) {
    const text = normalize(read(EVIDENCE)).toLowerCase();
    if (!/blocked explanation|blocked by environment|environment blocked/.test(text)) fail(`Blocked status requires blocked explanation`);
    if (/executed observations.*pass/i.test(text)) fail(`Blocked status must not claim executed observations`);
  }
  for (const row of rows) {
    if (row.status !== `PASS` && /\bPASS\b/i.test(row.observed)) {
      fail(`Non-PASS scenario must not describe observed result as PASS: ${row.id}`);
    }
  }
}

function validateRequiredCategories() {
  const docs = `${read(EVIDENCE)}\n${read(SUMMARY)}`;
  const lowerDocs = docs.toLowerCase();
  for (const category of requiredCategories) {
    if (!lowerDocs.includes(category.toLowerCase())) fail(`Docs missing required category: ${category}`);
  }
  const rows = parseScenarioRows();
  const rowCategories = rows.map(row => row.category.toLowerCase());
  for (const category of requiredCategories) {
    if (!rowCategories.includes(category.toLowerCase())) fail(`Scenario table missing required category row: ${category}`);
  }
}

function validateForbiddenClaims() {
  const docs = `${read(EVIDENCE)}\n${read(SUMMARY)}`;
  const combined = normalize(docs).toLowerCase();
  for (const claim of forbiddenPositiveClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 220), index + needle.length + 220);
      const guarded = /does not|do not|must not|not claim|not claimed|remaining gaps|guardrails|absence|zero|no `beta-ai`|no phase 22e/.test(context);
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
      if (![...phase22eForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22E forward-compat addition: ${line}`);
      }
      for (const path of phase22eForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22E path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase22ePaths) read(file);
requireHeadings(EVIDENCE, evidenceHeadings);
requireHeadings(SUMMARY, summaryHeadings);
validateWorkflow();
const evidenceStatus = parseStatusAndCount(EVIDENCE);
const summaryStatus = parseStatusAndCount(SUMMARY);
if (evidenceStatus.status !== summaryStatus.status) fail(`Status tokens differ between docs`);
if (evidenceStatus.count !== summaryStatus.count) fail(`Scenario count tokens differ between docs`);
validateScenarioTable(evidenceStatus.status, evidenceStatus.count);
validateRequiredCategories();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();

console.log(`Phase 22E broader manual evidence validation passed.`);
