#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const broadPathPatterns = [
  // Rejected examples: docs/**, docs/research/**, docs/release/**,
  // scripts/validate-*.js, src/**, tests/**.
  /^docs\/\*\*$/,
  /^docs\/research\/\*\*$/,
  /^docs\/release\/\*\*$/,
  /^scripts\/validate-\*\.js$/,
  /^src\/\*\*$/,
  /^tests\/\*\*$/,
  /[*?[\]{}]/,
];

function fail(message) {
  console.error(`register-phase-forward-compat failed: ${message}`);
  process.exit(1);
}

function splitList(value) {
  return String(value || ``).split(`,`).map(item => item.trim()).filter(Boolean);
}

function parseArgs(argv) {
  const args = { write: false, dryRun: true };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === `--write`) {
      args.write = true;
      args.dryRun = false;
      continue;
    }
    if (arg === `--dry-run`) {
      args.dryRun = true;
      continue;
    }
    if ([`--phase`, `--label`, `--after-phase`, `--paths`, `--validators`].includes(arg)) {
      args[arg.slice(2)] = argv[index + 1];
      index += 1;
      continue;
    }
    fail(`Unsupported argument: ${arg}`);
  }
  return args;
}

function assertExactPath(value, kind) {
  if (!value || value.startsWith(`/`) || value.includes(`\\`) || value.includes(`..`)) {
    fail(`${kind} must be a repository-relative exact path: ${value}`);
  }
  if (broadPathPatterns.some(pattern => pattern.test(value))) {
    fail(`${kind} must not be a wildcard or broad path: ${value}`);
  }
}

function quotePath(value, quote) {
  return `${quote}${value}${quote}`;
}

function detectQuote(line) {
  if (line.includes('`')) return '`';
  if (line.includes("'")) return "'";
  return '"';
}

function phaseToCompatName(phase) {
  // Examples: PHASE24D_HF1 -> phase24dHf1ForwardCompatPaths,
  // PHASE24E -> phase24eForwardCompatPaths.
  const words = String(phase || ``).toLowerCase().split(/_+/).filter(Boolean);
  if (words.length === 0) fail(`--phase must contain at least one word`);
  const [first, ...rest] = words;
  const camel = [
    first,
    ...rest.map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`),
  ].join(``);
  if (!/^[a-z][A-Za-z0-9]*$/.test(camel)) fail(`--phase cannot produce a safe variable name: ${phase}`);
  return `${camel}ForwardCompatPaths`;
}

function updateAfterMarker(source, label, afterPhase, paths, compatName) {
  const marker = new RegExp(`^([ \\t]*)// ${afterPhase.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)} forward-compat entries.*$`, `m`);
  const match = source.match(marker);
  if (!match || match.index === undefined) return null;

  const lines = source.split(/\n/);
  let markerLine = 0;
  let offset = 0;
  for (; markerLine < lines.length; markerLine += 1) {
    if (offset === match.index) break;
    offset += lines[markerLine].length + 1;
  }

  let cursor = markerLine + 1;
  while (cursor < lines.length && /`[^`]+`|'[^']+'|"[^"]+"/.test(lines[cursor])) cursor += 1;
  while (cursor < lines.length && /^\s*$/.test(lines[cursor])) cursor += 1;

  const nextLine = lines[markerLine + 1] || ``;
  const quote = detectQuote(nextLine);
  const addMatch = nextLine.match(/^(\s*)([A-Za-z0-9_$]+)\.add\(/);
  const constArrayMatch = nextLine.match(/^(\s*)const\s+([A-Za-z0-9_$]+)\s*=\s*\[(.*)\];\s*$/);
  const multiConstArrayMatch = nextLine.match(/^(\s*)const\s+([A-Za-z0-9_$]+)\s*=\s*\[\s*$/);
  const arrayIndent = (nextLine.match(/^(\s*)/) || [null, match[1] + `  `])[1];
  const existing = paths.filter(entry => source.includes(quotePath(entry, quote)));
  const missing = paths.filter(entry => !source.includes(quotePath(entry, quote)));
  if (missing.length === 0) return { changed: false, source, added: [], existing };

  const insert = [`${match[1]}// ${label}`];
  if (addMatch) {
    for (const entry of missing) insert.push(`${addMatch[1]}${addMatch[2]}.add(${quotePath(entry, quote)});`);
  } else if (constArrayMatch) {
    const entries = missing.map(entry => quotePath(entry, quote)).join(`, `);
    insert.push(`${constArrayMatch[1]}const ${compatName} = [${entries}];`);
    const spreadLine = new RegExp(`^(\\s*)for \\(const path of ${constArrayMatch[2]}\\) (.+)$`, `m`);
    const spreadMatch = source.match(spreadLine);
    if (spreadMatch) {
      const spreadIndex = lines.findIndex(line => line === spreadMatch[0]);
      lines.splice(spreadIndex + 1, 0, `${spreadMatch[1]}for (const path of ${compatName}) ${spreadMatch[2]}`);
    }
  } else if (multiConstArrayMatch) {
    const closeIndex = lines.findIndex((line, index) => index > markerLine && /^\s*\];\s*$/.test(line));
    if (closeIndex === -1) return null;
    const entries = missing.map(entry => `${multiConstArrayMatch[1]}  ${quotePath(entry, quote)},`);
    lines.splice(closeIndex + 1, 0, `${multiConstArrayMatch[1]}const ${compatName} = [`, ...entries, `${multiConstArrayMatch[1]}];`);
    const spreadNeedle = `...${multiConstArrayMatch[2]}`;
    const spreadIndex = lines.findIndex(line => line.includes(spreadNeedle));
    if (spreadIndex !== -1 && !lines[spreadIndex].includes(`...${compatName}`)) {
      lines[spreadIndex] = lines[spreadIndex].replace(spreadNeedle, `${spreadNeedle}, ...${compatName}`);
    }
    return { changed: true, source: lines.join(`\n`), added: missing, existing };
  } else if (/^\s*[`'"]/.test(nextLine)) {
    for (const entry of missing) insert.push(`${arrayIndent}${quotePath(entry, quote)},`);
  } else {
    return null;
  }
  lines.splice(cursor, 0, ...insert);
  return { changed: true, source: lines.join(`\n`), added: missing, existing };
}

function updateValidator(file, options) {
  const source = fs.readFileSync(file, `utf8`);
  const result = updateAfterMarker(source, options.label, options.afterPhase, options.paths, options.compatName);
  if (!result) fail(`${file} has unsupported validator pattern near ${options.afterPhase} forward-compat entries`);
  if (result.changed && options.write) fs.writeFileSync(file, result.source);
  return { file, ...result };
}

const args = parseArgs(process.argv);
const phase = args.phase || fail(`--phase is required`);
const label = args.label || `${phase} forward-compat entries`;
const afterPhase = args[`after-phase`] || fail(`--after-phase is required`);
const compatName = phaseToCompatName(phase);
const paths = splitList(args.paths);
const validators = splitList(args.validators);

if (paths.length === 0) fail(`--paths must include at least one exact path`);
if (validators.length === 0) fail(`--validators must include at least one exact validator path`);
for (const entry of paths) assertExactPath(entry, `forward-compat path`);
for (const validator of validators) {
  assertExactPath(validator, `validator path`);
  if (!validator.startsWith(`scripts/validate-`) || !validator.endsWith(`.js`)) fail(`validator must be an exact validator script: ${validator}`);
  if (!fs.existsSync(validator)) fail(`validator does not exist: ${validator}`);
}

const results = validators.map(file => updateValidator(path.normalize(file), { label, afterPhase, paths, write: args.write, compatName }));
const changed = results.filter(result => result.changed);
console.log(`${args.write ? `write` : `dry-run`}: ${phase} forward-compat registration`);
console.log(`validators=${validators.length} changed=${changed.length} paths=${paths.length} variable=${compatName}`);
for (const result of results) {
  console.log(`${result.changed ? `update` : `noop`}: ${result.file}${result.added.length ? ` added=${result.added.length}` : ``}`);
}
