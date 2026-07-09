import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/scheduler/schedulerAdapterContract.js',
  'src/scheduler/sm2SchedulerAdapter.js',
  'src/scheduler/fsrsBetaSchedulerAdapter.js',
  'src/scheduler/fsrsReadinessGate.js',
  'src/scheduler/schedulerRegistry.js',
  'src/scheduler/schedulerComparisonLab.js',
  'src/scheduler/schedulerBetaPreferenceModel.js',
  'src/scheduler/schedulerBackupMetadata.js',
  'tests/unit/schedulerAdapterContract.test.js',
  'tests/unit/sm2SchedulerAdapter.test.js',
  'tests/unit/fsrsBetaSchedulerAdapter.test.js',
  'tests/unit/fsrsReadinessGate.test.js',
  'tests/unit/schedulerRegistry.test.js',
  'tests/unit/schedulerComparisonLab.test.js',
  'tests/unit/schedulerBetaPreferenceModel.test.js',
  'tests/unit/schedulerBackupMetadata.test.js',
  'docs/scheduler/big-update-5-pluggable-scheduler-engine.md',
  'docs/scheduler/fsrs-beta-readiness-evidence.md',
  'docs/testing/scheduler-comparison-lab-test-matrix.md',
  'docs/release/big-update-5-scheduler-engine-summary.md'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`BIG-UPDATE-5 validation failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.['validate:scheduler-engine'] === 'node scripts/validate-big-update-5-scheduler-engine.js',
  'package.json missing validate:scheduler-engine script'
);

const docs = [
  read('docs/scheduler/big-update-5-pluggable-scheduler-engine.md'),
  read('docs/scheduler/fsrs-beta-readiness-evidence.md'),
  read('docs/release/big-update-5-scheduler-engine-summary.md')
].join('\n');

assert(/SM2 remains .*default/i.test(docs), 'docs must state SM2 remains default');
assert(/FSRS remains beta/i.test(docs), 'docs must state FSRS remains beta');
assert(/opt-in/i.test(docs), 'docs must state FSRS is opt-in');
assert(/does not approve FSRS as the default|FSRS default approval: no/i.test(docs), 'docs must deny FSRS default approval');
assert(/no cloud/i.test(docs), 'docs must state no cloud behavior');
assert(/Raw question\/answer required by scheduler:\s*no/i.test(docs), 'release summary must state raw question/answer is not required');

const schedulerSourceFiles = fs.readdirSync(path.join(root, 'src/scheduler'))
  .filter(name => name.endsWith('.js'))
  .map(name => `src/scheduler/${name}`);
const forbiddenTransportPatterns = [
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /navigator\.serial/,
  /navigator\.bluetooth/
];
for (const file of schedulerSourceFiles) {
  const source = read(file);
  for (const pattern of forbiddenTransportPatterns) {
    assert(!pattern.test(source), `${file} contains forbidden transport pattern ${pattern}`);
  }
}

const gateSource = read('src/scheduler/fsrsReadinessGate.js');
assert(/fsrsCanBeDefault:\s*false/.test(gateSource), 'fsrsCanBeDefault must remain false');

const contractSource = read('src/scheduler/schedulerAdapterContract.js');
for (const rawField of ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer']) {
  assert(contractSource.includes(`'${rawField}'`), `contract must explicitly block ${rawField}`);
}

const comparisonSource = read('src/scheduler/schedulerComparisonLab.js');
for (const scenario of [
  'new_card_good_recall',
  'new_card_bad_recall',
  'mature_card_good_recall',
  'mature_card_lapse',
  'overloaded_review_queue',
  'sparse_history',
  'dense_history',
  'inconsistent_user',
  'cramming_pattern',
  'long_absence_return',
  'low_energy_session',
  'high_review_pressure'
]) {
  assert(comparisonSource.includes(scenario), `comparison lab missing ${scenario}`);
}
assert(comparisonSource.includes('keep_sm2_default_fsrs_beta'), 'comparison lab must keep SM2 default recommendation');

console.log('BIG-UPDATE-5 scheduler engine validation passed.');
