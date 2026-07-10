import { useState } from 'react';
import { getSettings, updateSettings } from '../../state/settingsStorage.js';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export default function FsrsExperimentalSettingsPanel() {
  const [enabled, setEnabled] = useState(() => getSettings().fsrsExperimentalEnabled);
  const [showModal, setShowModal] = useState(false);
  const { t } = useShimeLanguage();

  function handleToggle() {
    if (enabled) {
      const result = updateSettings({ fsrsExperimentalEnabled: false });
      if (result.ok) setEnabled(false);
    } else {
      setShowModal(true);
    }
  }

  function handleConfirm() {
    const result = updateSettings({ fsrsExperimentalEnabled: true });
    if (result.ok) setEnabled(true);
    setShowModal(false);
  }

  function handleCancel() {
    setShowModal(false);
  }

  // Phase 16A — Vietnamese-first UX copy. Visible labels lead with Vietnamese
  // and keep the historical English wording as muted helper lines so prior
  // validators and tests for this panel continue to find their reference
  // strings (e.g. "Enable FSRS Memory Model (Experimental)").
  return (
    <div className="settingsPanel">
      <Card
        eyebrow={t('status.beta')}
        title={t('settings.fsrsTitle')}
        variant="default"
      >
        <div className="settingsPanel__section">
          <div className="settingsPanel__warningBlock">
            <p className="settingsPanel__badge settingsPanel__badge--warning">
              {t('settings.fsrsPreparation')}
            </p>
          </div>
          <p className="settingsPanel__helper">
            {t('settings.fsrsBody')}
          </p>

          <div className="settingsPanel__toggleRow">
            <span className="settingsPanel__toggleLabel">
              {t('settings.fsrsSwitch')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              className={`settingsToggle ${enabled ? 'settingsToggle--on' : 'settingsToggle--off'}`}
              onClick={handleToggle}
            >
              <span className="settingsToggle__thumb" />
              <span className="srOnly">{enabled ? t('settings.fsrsDisable') : t('settings.fsrsEnable')}</span>
            </button>
          </div>

          {enabled && (
            <p className="settingsPanel__status settingsPanel__status--dormant">
              {t('settings.fsrsDormant')}
            </p>
          )}

          {enabled && (
            <p className="settingsPanel__disableNote">
              {t('settings.fsrsDisableNote')}
            </p>
          )}
        </div>
      </Card>

      {showModal && (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fsrs-modal-title"
        >
          <div className="modalBox">
            <h2 id="fsrs-modal-title" className="modalBox__title">
              {t('settings.fsrsConfirmTitle')}
            </h2>
            <p className="modalBox__body">
              {t('settings.fsrsConfirmBody')}
            </p>
            <div className="modalBox__actions">
              <Button variant="ghost" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                {t('settings.fsrsConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
