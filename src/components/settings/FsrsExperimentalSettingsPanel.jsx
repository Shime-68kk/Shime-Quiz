import { useState } from 'react';
import { getSettings, updateSettings } from '../../state/settingsStorage.js';
import Button from '../Button.jsx';
import Card from '../Card.jsx';

export default function FsrsExperimentalSettingsPanel() {
  const [enabled, setEnabled] = useState(() => getSettings().fsrsExperimentalEnabled);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="settingsPanel">
      <Card
        eyebrow="Thử nghiệm"
        title="Enable FSRS Memory Model (Experimental)"
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__badge settingsPanel__badge--warning">
            Preparation Phase Only.
          </p>
          <p className="settingsPanel__helper">
            Turning this on prepares your device for the advanced DSR (Difficulty, Stability, Retrievability) scheduling engine.
            It only applies to future new cards in a later phase.
            It does not migrate existing cards.
            It does not change your current due dates or study screens today.
            Study Room four-rating FSRS review UI is not available yet.
          </p>

          <div className="settingsPanel__toggleRow">
            <span className="settingsPanel__toggleLabel">
              Experimental FSRS scheduling
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              className={`settingsToggle ${enabled ? 'settingsToggle--on' : 'settingsToggle--off'}`}
              onClick={handleToggle}
            >
              <span className="settingsToggle__thumb" />
              <span className="srOnly">{enabled ? 'Tắt' : 'Bật'} FSRS thử nghiệm</span>
            </button>
          </div>

          {enabled && (
            <p className="settingsPanel__status settingsPanel__status--dormant">
              Status: Dormant (Awaiting future update)
            </p>
          )}

          {enabled && (
            <p className="settingsPanel__disableNote">
              Disabling this pauses FSRS preparation. Future FSRS metadata, if generated in
              later phases, will be kept safely on this device and will not be deleted.
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
              Xác nhận bật FSRS thử nghiệm
            </h2>
            <p className="modalBox__body">
              You are enabling the scaffold for the experimental FSRS memory model. Your
              reviews will continue using the current system until the full FSRS update is
              released. This does not migrate existing cards and does not change current due
              dates. Proceed?
            </p>
            <div className="modalBox__actions">
              <Button variant="ghost" onClick={handleCancel}>
                Huỷ
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                Enable preparation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
