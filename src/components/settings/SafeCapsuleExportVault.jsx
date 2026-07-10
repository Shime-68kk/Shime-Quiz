import { useState } from 'react';
import {
  applySafeCapsuleExportVaultAction,
  createInitialSafeCapsuleExportVaultState,
  SAFE_CAPSULE_EXPORT_VAULT_ACTIONS
} from './safeCapsuleExportVaultModel.js';
import { serializeManualHandoffJsonl } from '../../deviceBridge/safeCapsuleManualExportPackage.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

function Manifest({ manifest, t }) {
  if (!manifest) return <p className="muted">{t('developer.noManifest')}</p>;
  return (
    <dl className="settingsCompactList" aria-label="Manual handoff manifest">
      <div><dt>package count</dt><dd>{manifest.packageCount}</dd></div>
      <div><dt>evidence count</dt><dd>{manifest.evidenceCount}</dd></div>
      <div><dt>checksum</dt><dd>{manifest.checksumStatus}</dd></div>
      <div><dt>privacy</dt><dd>{manifest.privacyStatus}</dd></div>
      <div><dt>compatibility</dt><dd>{manifest.compatibilityStatus}</dd></div>
      <div><dt>import path</dt><dd>{manifest.importPathHint}</dd></div>
      <div><dt>instructions</dt><dd>{manifest.instructionsCode}</dd></div>
    </dl>
  );
}

export default function SafeCapsuleExportVault() {
  const { t } = useShimeLanguage();
  const [state, setState] = useState(() => createInitialSafeCapsuleExportVaultState());
  const run = action => setState(current => applySafeCapsuleExportVaultAction(current, action));

  const copyJsonl = () => {
    run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_COPIED);
  };

  const downloadJsonl = () => {
    if (!state.handoffPack || !state.lastFileName) return;
    const blob = new Blob([serializeManualHandoffJsonl(state.handoffPack)], { type: 'application/jsonl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = state.lastFileName;
    link.click();
    URL.revokeObjectURL(url);
    run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_DOWNLOADED);
  };

  return (
    <section className="settingsPanel safeCapsuleExportVault" aria-label={t('developer.exportLabel')}>
      <div className="sectionHeader">
        <p className="eyebrow">Manual handoff · Mock only</p>
        <h2>{t('developer.exportLabel')}</h2>
      </div>
      <div className="settingsNotice" role="note">
        <strong>{t('developer.exportTitle')}</strong>
        <p>{t('developer.exportBody')}</p>
        <p>{t('developer.exportInstruction')}</p>
      </div>

      <div className="settingsActions" aria-label="Safe capsule export vault controls">
        <button type="button" onClick={() => run({ type: SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_SCENARIO, scenarioId: 'steady_progress' })}>{t('developer.addSteady')}</button>
        <button type="button" onClick={() => run({ type: SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_SCENARIO, scenarioId: 'struggling_streak' })}>{t('developer.addStruggling')}</button>
        <button type="button" onClick={() => run({ type: SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_SCENARIO, scenarioId: 'review_pressure_high' })}>{t('developer.addPressure')}</button>
        <button type="button" onClick={() => run({ type: SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_SCENARIO, scenarioId: 'low_energy_focus' })}>{t('developer.addLowEnergy')}</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_ALL_SAFE)}>{t('developer.addAllSafe')}</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.REJECT_ADVERSARIAL)}>{t('developer.testRawAttack')}</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.BUILD_HANDOFF)} disabled={!state.packageCount}>{t('developer.buildHandoff')}</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.VERIFY_HANDOFF)} disabled={!state.handoffPack}>{t('developer.verifyHandoff')}</button>
        <button type="button" onClick={copyJsonl} disabled={!state.copyReady}>{t('developer.copyJsonl')}</button>
        <button type="button" onClick={downloadJsonl} disabled={!state.downloadReady}>{t('developer.downloadJsonl')}</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.CLEAR)}>{t('developer.clearVault')}</button>
      </div>

      <dl className="settingsCompactList" aria-label="Manual export vault status">
        <div><dt>package count</dt><dd>{state.packageCount}</dd></div>
        <div><dt>evidence count</dt><dd>{state.evidenceCount}</dd></div>
        <div><dt>accepted count</dt><dd>{state.acceptedCount}</dd></div>
        <div><dt>rejected count</dt><dd>{state.rejectedCount}</dd></div>
        <div><dt>verification</dt><dd>{state.lastVerificationStatus}</dd></div>
        <div><dt>file name</dt><dd>{state.lastFileName || 'not_ready'}</dd></div>
        <div><dt>checksum32</dt><dd>{state.verificationResult?.checksum32 || 'not_ready'}</dd></div>
        <div><dt>no-send status</dt><dd>{state.noSendStatus}</dd></div>
        <div><dt>no-connection status</dt><dd>{state.noConnectionStatus}</dd></div>
      </dl>

      <Manifest manifest={state.manifestPreview} t={t} />

      <ul className="settingsChecklist" aria-label="Manual export privacy checklist">
        <li><strong>OK</strong><span>R5X19.2 compatibility preserved</span></li>
        <li><strong>OK</strong><span>realBridgeEnabled false</span></li>
        <li><strong>OK</strong><span>transportEnabled false</span></li>
        <li><strong>OK</strong><span>browserPersistenceEnabled false</span></li>
      </ul>

      <label className="settingsField">
        <span>Safe JSONL preview</span>
        <textarea readOnly rows={8} value={state.lastJsonlPreviewSafe} aria-label="Safe JSONL preview" />
      </label>
    </section>
  );
}
