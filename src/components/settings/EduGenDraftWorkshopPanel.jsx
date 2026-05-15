import { useState } from 'react';
import { getSettings, updateSettings } from '../../state/settingsStorage.js';
import {
  EDUGEN_HEALTH_STATUS,
  checkEdugenHealth,
  isEdugenServiceConfigured,
  normalizeEdugenServiceUrl
} from '../../edugen/edugenConnector.js';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';

const STATUS_IDLE = 'idle';
const STATUS_CHECKING = 'checking';

export default function EduGenDraftWorkshopPanel() {
  const [storedUrl, setStoredUrl] = useState(() => getSettings().edugenServiceUrl || '');
  const [draftUrl, setDraftUrl] = useState(storedUrl);
  const [phase, setPhase] = useState(STATUS_IDLE);
  const [lastCheck, setLastCheck] = useState(null);
  const [saveError, setSaveError] = useState('');

  function handleUrlChange(event) {
    setDraftUrl(event.target.value);
  }

  function handleSave() {
    setSaveError('');
    const normalized = normalizeEdugenServiceUrl(draftUrl);
    const trimmed = draftUrl.trim();
    if (trimmed && !normalized) {
      setSaveError('URL EduGen không hợp lệ. Hãy dùng địa chỉ http(s) đầy đủ.');
      return;
    }
    const result = updateSettings({ edugenServiceUrl: normalized });
    if (!result.ok) {
      setSaveError('Không lưu được URL dịch vụ EduGen. Vui lòng thử lại.');
      return;
    }
    setStoredUrl(normalized);
    setDraftUrl(normalized);
    setLastCheck(null);
  }

  function handleClear() {
    setSaveError('');
    const result = updateSettings({ edugenServiceUrl: '' });
    if (!result.ok) {
      setSaveError('Không xoá được URL dịch vụ EduGen.');
      return;
    }
    setStoredUrl('');
    setDraftUrl('');
    setLastCheck(null);
  }

  async function handleHealthCheck() {
    if (phase === STATUS_CHECKING) return;
    setPhase(STATUS_CHECKING);
    setLastCheck(null);
    const result = await checkEdugenHealth(storedUrl);
    setPhase(STATUS_IDLE);
    setLastCheck(result);
  }

  const configured = isEdugenServiceConfigured(storedUrl);

  const checkLabel = phase === STATUS_CHECKING
    ? 'Đang kiểm tra…'
    : 'Kiểm tra kết nối';

  let statusBadgeTone = 'neutral';
  let statusLabel = 'Chưa cấu hình';
  let statusHelper = 'Bạn chưa cấu hình URL dịch vụ EduGen. Shime vẫn hoạt động bình thường ở chế độ local-first; chỉ là tính năng Xưởng bản nháp tạm thời không sẵn sàng.';
  if (lastCheck) {
    if (lastCheck.status === EDUGEN_HEALTH_STATUS.REACHABLE) {
      statusBadgeTone = 'success';
      statusLabel = 'Dịch vụ phản hồi';
      statusHelper = 'Đã kết nối được EduGen Draft Workshop. Kết quả vẫn chỉ là bản nháp, bạn cần xem lại trước khi học.';
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.TIMEOUT) {
      statusBadgeTone = 'warning';
      statusLabel = 'Quá thời gian';
      statusHelper = 'Yêu cầu kiểm tra hết thời gian. Hãy chắc chắn dịch vụ EduGen đang chạy và trình duyệt truy cập được.';
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.NOT_CONFIGURED) {
      statusBadgeTone = 'neutral';
      statusLabel = 'Chưa cấu hình';
      statusHelper = 'Hãy nhập URL của dịch vụ EduGen rồi lưu trước khi kiểm tra.';
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.INVALID_URL) {
      statusBadgeTone = 'warning';
      statusLabel = 'URL không hợp lệ';
      statusHelper = 'Hãy nhập URL http(s) hợp lệ.';
    } else {
      statusBadgeTone = 'warning';
      statusLabel = 'Không phản hồi';
      statusHelper = 'Không kết nối được EduGen Draft Workshop. Hãy kiểm tra service, CORS và quyền mạng của trình duyệt.';
    }
  } else if (configured) {
    statusBadgeTone = 'neutral';
    statusLabel = 'Chưa kiểm tra';
    statusHelper = 'Đã có URL dịch vụ EduGen. Bấm “Kiểm tra kết nối” khi bạn muốn xem dịch vụ có sẵn sàng.';
  }

  return (
    <div className="settingsPanel edugenWorkshopPanel" aria-label="Cấu hình Xưởng bản nháp EduGen">
      <Card
        eyebrow="Tuỳ chọn"
        title="Xưởng bản nháp EduGen"
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__helperSecondary">
            EduGen Draft Workshop — optional companion service. Not bundled with Shime.
          </p>
          <p className="settingsPanel__helper">
            EduGen là dịch vụ Xưởng bản nháp tuỳ chọn dành cho việc tạo bản nháp câu hỏi từ tài liệu của bạn.
            Shime không tự xử lý PDF/DOCX nếu không có dịch vụ EduGen đang chạy.
            Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.
            Không cần tài khoản, không cần API key, không có cloud sync.
          </p>
          <p className="settingsPanel__helperSecondary">
            EduGen is an optional companion you run separately. Shime keeps your data local and never calls an AI provider on your behalf.
          </p>

          <label className="edugenWorkshopPanel__fieldLabel" htmlFor="edugenServiceUrlInput">
            URL dịch vụ EduGen (Tùy chọn)
          </label>
          <input
            id="edugenServiceUrlInput"
            type="url"
            inputMode="url"
            spellCheck="false"
            autoComplete="off"
            placeholder="http://localhost:3333"
            value={draftUrl}
            onChange={handleUrlChange}
            className="edugenWorkshopPanel__urlInput"
            aria-describedby="edugenServiceUrlHelp"
          />
          <p id="edugenServiceUrlHelp" className="settingsPanel__helperSecondary">
            Service URL — health check only. Document upload is not performed by this panel.
          </p>

          {saveError && (
            <p
              className="edugenWorkshopPanel__error"
              role="alert"
            >
              {saveError}
            </p>
          )}

          <div className="edugenWorkshopPanel__actions">
            <Button type="button" variant="primary" onClick={handleSave}>
              Lưu URL
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} disabled={!storedUrl}>
              Xoá URL
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleHealthCheck}
              disabled={!configured || phase === STATUS_CHECKING}
            >
              {checkLabel}
            </Button>
          </div>

          <div className="edugenWorkshopPanel__status" aria-live="polite">
            <Badge tone={statusBadgeTone}>{statusLabel}</Badge>
            <p className="settingsPanel__helper">{statusHelper}</p>
            {configured && (
              <p className="settingsPanel__helperSecondary edugenWorkshopPanel__storedUrl">
                Đang dùng: {storedUrl}
              </p>
            )}
          </div>

          <ul className="edugenWorkshopPanel__guardrails">
            <li>EduGen là dịch vụ riêng (optional companion), không được bundle trong Shime.</li>
            <li>Bản nháp do EduGen tạo cần được bạn xem lại trước khi đưa vào học (review required).</li>
            <li>Shime không tự bật xếp lịch ghi nhớ (no automatic FSRS activation) khi bạn cấu hình EduGen.</li>
            <li>Không có cloud sync, không có tài khoản, dữ liệu vẫn local-first.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
