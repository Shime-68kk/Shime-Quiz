import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED = [
  'src/components/settings/SafeCapsuleExportVault.jsx',
  'src/components/settings/safeCapsuleExportVaultModel.js',
  'src/deviceBridge/safeCapsuleManualExportPackage.js',
  'tests/unit/safeCapsuleManualExportPackage.test.js',
  'tests/unit/safeCapsuleExportVaultModel.test.js',
  'tests/unit/SafeCapsuleExportVault.test.jsx',
  'tests/unit/createSafeCapsuleManualHandoffScript.test.js',
  'e2e/safe-capsule-export-vault.spec.js',
  'docs/device-bridge/big-update-3-safe-capsule-export-vault.md',
  'docs/release/big-update-3-safe-capsule-export-vault-summary.md',
  'docs/testing/big-update-3-safe-capsule-export-vault-test-matrix.md'
];
const RUNTIME = [
  'src/components/settings/SafeCapsuleExportVault.jsx',
  'src/components/settings/safeCapsuleExportVaultModel.js',
  'src/deviceBridge/safeCapsuleManualExportPackage.js'
];
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function assert(c, m) { if (!c) throw new Error(m); }
function exists(p) { assert(fs.existsSync(path.join(ROOT, p)), `Missing ${p}`); }

function main() {
  REQUIRED.forEach(exists);
  const docs = [
    'docs/device-bridge/big-update-3-safe-capsule-export-vault.md',
    'docs/release/big-update-3-safe-capsule-export-vault-summary.md',
    'docs/testing/big-update-3-safe-capsule-export-vault-test-matrix.md'
  ].map(read).join('\n').toLowerCase();
  assert(/manual handoff|bàn giao thủ công/.test(docs), 'Docs must mention manual handoff.');
  assert(/mock-only|mock only|chỉ mô phỏng/.test(docs), 'Docs must mention mock-only.');
  assert(/no real bridge|not a real robot bridge/.test(docs), 'Docs must say no real bridge.');
  assert(/no raw quiz\/study\/history|raw quiz\/study\/history export/.test(docs), 'Docs must say no raw quiz/study/history export.');
  assert(/serial\/websocket\/ble\/wi-fi\/cloud\/backend\/ai\/api/.test(docs), 'Docs must say no Serial/WebSocket/BLE/Wi-Fi/cloud/backend/AI/API.');

  const settings = read('src/routes/Settings.jsx');
  assert(/SafeCapsuleExportVault/.test(settings), 'Settings must reference SafeCapsuleExportVault.');
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.['test:e2e:safe-capsule-export'], 'package.json missing export e2e script.');
  assert(/--handoff/.test(read('scripts/create-safe-capsule-mock-import-package.js')), 'CLI must support --handoff.');

  for (const file of RUNTIME) {
    const source = read(file);
    assert(!/navigator\.serial|navigator\.bluetooth|new\s+WebSocket\s*\(|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/i.test(source), `${file} contains forbidden runtime API.`);
    assert(!/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i.test(source), `${file} renders send/connect controls.`);
  }
  const vault = read('src/components/settings/SafeCapsuleExportVault.jsx');
  assert(/Blob/.test(vault) && /URL\.createObjectURL/.test(vault) && /URL\.revokeObjectURL/.test(vault), 'Vault must implement explicit download ObjectURL lifecycle.');
  assert(!/navigator\.clipboard/.test(vault), 'Clipboard API should be absent or explicit-click only; this implementation uses mark-copied fallback.');
  assert(!/private question|private answer|HomeNetwork|secret-token|card_private/.test(vault), 'UI source must not contain raw payload values.');
  console.log('BIG_UPDATE_3_SAFE_CAPSULE_EXPORT_VAULT_VALIDATED');
}

main();
