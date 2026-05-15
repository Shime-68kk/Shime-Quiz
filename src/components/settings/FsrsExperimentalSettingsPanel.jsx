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

  // Phase 16A — Vietnamese-first UX copy. Visible labels lead with Vietnamese
  // and keep the historical English wording as muted helper lines so prior
  // validators and tests for this panel continue to find their reference
  // strings (e.g. "Enable FSRS Memory Model (Experimental)").
  return (
    <div className="settingsPanel">
      <Card
        eyebrow="Thử nghiệm"
        title="Bật xếp lịch ghi nhớ thử nghiệm"
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__helperSecondary">
            Enable FSRS Memory Model (Experimental)
          </p>
          <p className="settingsPanel__badge settingsPanel__badge--warning">
            Chỉ là giai đoạn chuẩn bị.
          </p>
          <p className="settingsPanel__helperSecondary">
            Preparation Phase Only.
          </p>
          <p className="settingsPanel__helper">
            Bật tuỳ chọn này chuẩn bị thiết bị của bạn cho cách xếp lịch ôn tập mới dựa trên mức độ ghi nhớ.
            Tuỳ chọn này chỉ áp dụng cho các thẻ mới trong giai đoạn sau.
            Không chuyển đổi các thẻ hiện có.
            Không thay đổi ngày đến hạn ôn hôm nay và không thay đổi giao diện học hiện tại.
            Giao diện đánh giá bốn mức trong Phòng học chưa khả dụng.
          </p>
          <p className="settingsPanel__helperSecondary">
            It does not migrate existing cards. It does not change your current due dates today.
            Study Room four-rating FSRS review UI is not available yet.
          </p>

          <div className="settingsPanel__toggleRow">
            <span className="settingsPanel__toggleLabel">
              Xếp lịch ghi nhớ thử nghiệm
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              className={`settingsToggle ${enabled ? 'settingsToggle--on' : 'settingsToggle--off'}`}
              onClick={handleToggle}
            >
              <span className="settingsToggle__thumb" />
              <span className="srOnly">{enabled ? 'Tắt' : 'Bật'} xếp lịch ghi nhớ thử nghiệm</span>
            </button>
          </div>

          {enabled && (
            <p className="settingsPanel__status settingsPanel__status--dormant">
              Trạng thái: Đang chờ (Status: Dormant (Awaiting future update))
            </p>
          )}

          {enabled && (
            <p className="settingsPanel__disableNote">
              Tắt tuỳ chọn này sẽ tạm dừng phần chuẩn bị. Nếu giai đoạn sau có tạo dữ liệu ghi nhớ, dữ liệu vẫn được giữ an toàn trên thiết bị này và không bị xoá. Disabling this pauses FSRS preparation.
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
              Xác nhận bật xếp lịch ghi nhớ thử nghiệm
            </h2>
            <p className="modalBox__body">
              Bạn đang bật phần khung chuẩn bị cho cách xếp lịch ghi nhớ thử nghiệm. Lịch ôn tập của bạn vẫn dùng cách tính hiện tại cho đến khi bản cập nhật đầy đủ được phát hành. Tuỳ chọn này không chuyển đổi các thẻ hiện có và không thay đổi ngày đến hạn hiện tại. Tiếp tục?
            </p>
            <p className="modalBox__bodySecondary">
              You are enabling the scaffold for the experimental FSRS memory model. Your reviews will continue using the current system.
            </p>
            <div className="modalBox__actions">
              <Button variant="ghost" onClick={handleCancel}>
                Huỷ
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                Bật chuẩn bị (Enable preparation)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
