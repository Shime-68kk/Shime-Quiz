import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED = [
  'src/robotSensing/radarTofFusionModel.js',
  'src/robotSensing/radarTofScenarioSimulator.js',
  'src/robotSensing/radarTofTestProtocol.js',
  'scripts/run-radar-tof-sensing-scenarios.js',
  'tests/unit/radarTofFusionModel.test.js',
  'tests/unit/radarTofScenarioSimulator.test.js',
  'tests/unit/radarTofTestProtocol.test.js',
  'tests/unit/runRadarTofSensingScenariosScript.test.js',
  'docs/robot-sensing/r6x0-radar-tof-architecture.md',
  'docs/robot-sensing/r6x1-radar-tof-simulator.md',
  'docs/testing/r6x-radar-tof-environment-test-protocol.md',
  'docs/release/r6x0-r6x1-radar-tof-sensing-summary.md'
];
const SOURCE = [
  'src/robotSensing/radarTofFusionModel.js',
  'src/robotSensing/radarTofScenarioSimulator.js',
  'src/robotSensing/radarTofTestProtocol.js',
  'scripts/run-radar-tof-sensing-scenarios.js'
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  REQUIRED.forEach(file => assert(fs.existsSync(path.join(ROOT, file)), `Missing ${file}`));
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.['test:robot-sensing-sim'], 'package.json missing test:robot-sensing-sim');

  const forbidden = /navigator\.serial|navigator\.bluetooth|new\s+WebSocket\s*\(|fetch\s*\(|XMLHttpRequest|SerialPort|getUserMedia|MediaRecorder/i;
  SOURCE.forEach(file => assert(!forbidden.test(read(file)), `${file} contains forbidden hardware/network/media API`));

  const docs = [
    'docs/robot-sensing/r6x0-radar-tof-architecture.md',
    'docs/robot-sensing/r6x1-radar-tof-simulator.md',
    'docs/testing/r6x-radar-tof-environment-test-protocol.md',
    'docs/release/r6x0-r6x1-radar-tof-sensing-summary.md'
  ].map(read).join('\n').toLowerCase();
  assert(/no camera/.test(docs) && /no microphone|no mic/.test(docs) && /no cloud/.test(docs), 'Docs must state no camera/mic/cloud');
  assert(/radar does not replace tof/.test(docs), 'Docs must state radar does not replace ToF');
  assert(/esp32-s3/.test(docs) && /hlk-ld2410\/ld2410b/.test(docs) && /vl53l0x/.test(docs), 'Docs must mention target hardware stack');
  console.log('R6X0_R6X1_RADAR_TOF_SENSING_VALIDATED');
}

main();
