import { useEffect, useRef, useState } from 'react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import Toast from '../Toast.jsx';
import {
  V2_BACKUP_MODES,
  createV2BackupFileName,
  createV2BackupPayload,
  downloadV2Backup,
  estimateV2BackupPayloadSize,
  parseV2BackupJson,
  restoreV2BackupPayload
} from '../../state/v2BackupRestore.js';
import { getStorageQuotaWarningState } from '../../utils/storageQuotaEstimate.js';

const sectionLabels = {
  library: 'Thư viện',
  studyHistory: 'Lịch sử học',
  reviewSchedule: 'Lịch ôn tập',
  recommendationFeedback: 'Phản hồi gợi ý',
  studyGoal: 'Mục tiêu học tập',
  studyPlanProgress: 'Tiến trình kế hoạch'
};

const backupModeOptions = [
  {
    value: V2_BACKUP_MODES.FULL,
    label: 'Sao lưu đầy đủ',
    description: 'Bao gồm thư viện, đáp án và toàn bộ tiến trình học. Có thể chứa đáp án đúng.'
  },
  {
    value: V2_BACKUP_MODES.REDACTED_LIBRARY,
    label: 'Sao lưu đã ẩn đáp án',
    description: 'Giữ cấu trúc thư viện và câu hỏi, nhưng ẩn các trường đáp án. Không dùng để khôi phục đầy đủ.'
  },
  {
    value: V2_BACKUP_MODES.PROGRESS_ONLY,
    label: 'Sao lưu tiến trình',
    description: 'Chỉ gồm tiến trình học. Cần thư viện học tương ứng để khôi phục đầy đủ ý nghĩa.'
  }
];

const backupModeLabels = Object.fromEntries(backupModeOptions.map(option => [option.value, option.label]));

function createWebShareBackupFile(payload, filename) {
  if (typeof Blob === 'undefined' || typeof File === 'undefined') return null;
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  return new File([blob], filename, { type: 'application/json' });
}

function hasWebShareApi() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

function canShareBackupFile(file) {
  if (!file || !hasWebShareApi()) return false;
  if (typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function getWebShareFallbackMessage(file) {
  if (!hasWebShareApi()) {
    return 'Trình duyệt này chưa hỗ trợ Web Share. Hãy dùng nút Sao lưu dữ liệu để tải file sao lưu như bình thường.';
  }
  if (typeof navigator.canShare !== 'function') {
    return 'Trình duyệt này chưa xác nhận được khả năng chia sẻ file. Hãy dùng Sao lưu dữ liệu để tải file sao lưu rồi chia sẻ bằng nơi bạn tin tưởng.';
  }
  if (!file) {
    return 'Chưa tạo được file sao lưu để chia sẻ. Hãy thử lại hoặc dùng Sao lưu dữ liệu để tải file xuống.';
  }
  try {
    if (!navigator.canShare({ files: [file] })) {
      return 'Thiết bị hoặc trình duyệt chưa hỗ trợ chia sẻ loại file sao lưu này. Hãy dùng Sao lưu dữ liệu để tải file xuống rồi gửi file theo cách bạn tin tưởng.';
    }
  } catch {
    return 'Trình duyệt không hoàn tất kiểm tra chia sẻ file. Hãy dùng Sao lưu dữ liệu để tải file sao lưu xuống.';
  }
  return '';
}

function IssueList({ title, issues, tone = 'warning' }) {
  if (!Array.isArray(issues) || !issues.length) return null;
  return (
    <div className={`backupIssues backupIssues--${tone}`}>
      <strong>{title}</strong>
      <ul>
        {issues.slice(0, 8).map((issue, index) => (
          <li key={`${issue.code}-${issue.path}-${index}`}>
            {issue.message}
            {issue.path ? <small>{issue.path}</small> : null}
          </li>
        ))}
      </ul>
      {issues.length > 8 ? <p className="muted">Còn {issues.length - 8} mục khác.</p> : null}
    </div>
  );
}

function RestorePreview({ preview, fileName, onApply, onCancel, isRestoring }) {
  if (!preview) return null;
  const sectionKeys = preview.validation?.dataTypes || [];
  const restoreSupported = Boolean(preview.validation?.restoreSupported);
  const backupMode = preview.validation?.backupMode || V2_BACKUP_MODES.FULL;

  return (
    <Card title="Review backup file" eyebrow="Receive data" variant="elevated" className="backupPreview">
      <div className="backupPreview__header">
        <div>
          <p className="muted">File đã chọn</p>
          <strong>{fileName}</strong>
        </div>
        <div className="backupPreview__badges">
          <Badge tone={preview.ok ? 'success' : 'danger'}>
            {preview.ok ? 'File hợp lệ' : 'File sao lưu không hợp lệ'}
          </Badge>
          <Badge tone={restoreSupported ? 'success' : 'warning'}>
            {restoreSupported ? 'Có thể khôi phục' : 'Không khôi phục đầy đủ'}
          </Badge>
        </div>
      </div>

      <div className="backupModeSummary">
        <span>Loại sao lưu</span>
        <strong>{backupModeLabels[backupMode] || backupMode}</strong>
      </div>

      <div className="badgeList" aria-label="Dữ liệu có trong file sao lưu">
        {sectionKeys.length ? sectionKeys.map(key => (
          <Badge key={key} tone="info">{sectionLabels[key] || key}</Badge>
        )) : <Badge tone="neutral">Chưa có phần dữ liệu hợp lệ</Badge>}
      </div>

      <IssueList title="Lỗi cần sửa" issues={preview.validation.errors || []} tone="danger" />
      <IssueList title="Cảnh báo" issues={preview.validation.warnings || []} tone="warning" />

      {!restoreSupported && preview.validation?.restoreBlockMessage ? (
        <div className="backupModeWarning" role="note">
          {preview.validation.restoreBlockMessage}
        </div>
      ) : null}

      <p className="muted">
        Restore from backup only writes recognized Shime v2 data keys. Other browser data and PWA cache are not changed.
      </p>

      <div className="backupActions">
        <Button type="button" onClick={onApply} disabled={!preview.ok || !restoreSupported} loading={isRestoring}>
          Move my quizzes to this device
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default function V2BackupRestorePanel({ libraryData, librarySource, librarySummary }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupSize, setLastBackupSize] = useState(null);
  const [backupMode, setBackupMode] = useState(V2_BACKUP_MODES.FULL);
  const [storageQuotaWarning, setStorageQuotaWarning] = useState(null);
  const webShareAvailable = hasWebShareApi();

  useEffect(() => {
    let mounted = true;

    getStorageQuotaWarningState().then((result) => {
      if (!mounted) return;
      setStorageQuotaWarning(result.shouldWarn ? result : null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  function openRestoreFilePicker() {
    fileInputRef.current?.click();
  }

  function resetRestorePreview() {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function exportBackup() {
    setIsExporting(true);
    setStatus(null);

    try {
      const result = createV2BackupPayload({ libraryData, librarySource, librarySummary, mode: backupMode });
      if (!result.ok) {
        setStatus({
          tone: 'danger',
          title: 'Không thể sao lưu dữ liệu',
          description: 'Dữ liệu thư viện hiện tại chưa hợp lệ nên sao lưu đã bị chặn.'
        });
        return;
      }

      const filename = createV2BackupFileName();
      const sizeEstimate = estimateV2BackupPayloadSize(result.payload);
      setLastBackupSize(sizeEstimate);
      const downloadResult = downloadV2Backup(result.payload, filename);
      setStatus({
        tone: downloadResult.ok ? 'success' : 'danger',
        title: downloadResult.ok ? 'Đã tạo file sao lưu' : 'Không thể sao lưu dữ liệu',
        description: downloadResult.ok
          ? `Hãy giữ riêng tư file ${backupModeLabels[backupMode] || 'sao lưu'} này và khôi phục trên thiết bị khác: ${filename}.`
          : downloadResult.message || 'Trình duyệt chưa cho phép Shime tạo file tải xuống lúc này.'
      });
    } finally {
      setIsExporting(false);
    }
  }


  async function shareBackup() {
    setIsSharing(true);
    setStatus(null);

    try {
      const result = createV2BackupPayload({ libraryData, librarySource, librarySummary, mode: backupMode });
      if (!result.ok) {
        setStatus({
          tone: 'danger',
          title: 'Không thể chia sẻ file sao lưu',
          description: 'Dữ liệu thư viện hiện tại chưa hợp lệ nên file sao lưu chưa được tạo.'
        });
        return;
      }

      const filename = createV2BackupFileName();
      const sizeEstimate = estimateV2BackupPayloadSize(result.payload);
      setLastBackupSize(sizeEstimate);
      const file = createWebShareBackupFile(result.payload, filename);

      const fallbackMessage = getWebShareFallbackMessage(file);
      if (fallbackMessage || !canShareBackupFile(file)) {
        setStatus({
          tone: 'info',
          title: 'Hãy dùng Sao lưu dữ liệu để tải file sao lưu',
          description: fallbackMessage || 'Thiết bị hoặc trình duyệt chưa hỗ trợ chia sẻ file sao lưu. File tải xuống bình thường vẫn là đường dự phòng.'
        });
        return;
      }

      await navigator.share({
        title: 'Shime backup file',
        text: 'Backup file for moving Shime quizzes to another device. Keep it private.',
        files: [file]
      });

      setStatus({
        tone: 'success',
        title: 'Đã mở bảng chia sẻ file sao lưu',
        description: 'Nếu bạn đã chọn điểm đến, hãy chỉ gửi file sao lưu qua nơi bạn tin tưởng. Thao tác này không tạo đồng bộ đám mây tự động.'
      });
    } catch (error) {
      setStatus({
        tone: error?.name === 'AbortError' ? 'info' : 'warning',
        title: error?.name === 'AbortError' ? 'Bạn đã hủy chia sẻ file sao lưu' : 'Chia sẻ file sao lưu chưa hoàn tất',
        description: error?.name === 'AbortError'
          ? 'Không có dữ liệu nào bị thay đổi. Bạn vẫn có thể dùng Sao lưu dữ liệu để tải file sao lưu xuống khi cần.'
          : error?.message || 'Trình duyệt không hoàn tất chia sẻ. Hãy dùng Sao lưu dữ liệu để tải file xuống; dữ liệu sao lưu không bị thay đổi.'
      });
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsReading(true);
    setStatus(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseV2BackupJson(text);
      setPreview(parsed);
      setStatus({
        tone: parsed.ok ? 'success' : 'danger',
        title: parsed.ok ? 'File sao lưu sẵn sàng khôi phục' : 'File sao lưu không hợp lệ',
        description: parsed.ok
          ? 'Hãy kiểm tra danh sách dữ liệu trước khi chuyển quiz vào thiết bị này.'
          : 'File bị hỏng hoặc không phải file sao lưu Shime v2.'
      });
    } catch (error) {
      setPreview(null);
      setStatus({
        tone: 'danger',
        title: 'Không đọc được file sao lưu',
        description: error?.message || 'Trình duyệt không thể đọc file này.'
      });
    } finally {
      setIsReading(false);
    }
  }

  function applyRestore() {
    if (!preview?.ok || !preview.payload) return;
    const confirmed = window.confirm('Restore from backup? This can overwrite current Shime data on this device. Make sure this is the backup file you want to receive.');
    if (!confirmed) return;

    setIsRestoring(true);
    try {
      const result = restoreV2BackupPayload(preview.payload);
      if (!result.ok) {
        setStatus({
          tone: 'danger',
          title: 'Khôi phục thất bại',
          description: result.error === 'unsupported_backup_mode'
            ? result.message || 'File sao lưu này không thể khôi phục như bản đầy đủ.'
            : result.error === 'storage_unavailable'
              ? 'Trình duyệt không cho phép ghi bộ nhớ cục bộ.'
              : result.error === 'storage_preflight_failed'
                ? 'Bộ nhớ cục bộ không đủ dung lượng để khôi phục an toàn.'
                : result.rollbackOk === false
                  ? 'Khôi phục thất bại và không thể hoàn tác đầy đủ. Hãy tải lại trang và kiểm tra dữ liệu.'
                  : 'Khôi phục bị chặn để tránh trạng thái dữ liệu khôi phục một phần.'
        });
        return;
      }

      setStatus({
        tone: 'success',
        title: 'Khôi phục hoàn tất',
        description: 'File sao lưu đã được khôi phục trên thiết bị này. Dashboard và Thư viện sẽ tự cập nhật.'
      });
      resetRestorePreview();
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Card title="Sao lưu dữ liệu" eyebrow="Sao lưu v2 · This device only" variant="elevated" className="backupRestoreCard">
      <p className="muted">
        <strong>Transfer data between devices:</strong> Shime stores data on this device. To move quizzes to another device, save a backup file here, then restore it on the other device. Current transfer uses the existing backup file flow; it does not create automatic cloud sync.
      </p>
      <p className="muted">
        This backup can include the library, study history, review schedule, recommendation feedback, study goal, and plan progress. Study Room drafts are not included so old study sessions are not restored accidentally.
      </p>

      <div className="backupPlaintextNotice" role="note">
        <strong>Privacy note:</strong> Backup files may include quiz content, answers, progress, and study history. Keep them private and only send them through places you trust. This is a manual transfer file, not cloud or account sync.
      </div>

      {storageQuotaWarning ? (
        <div className="storageQuotaWarning" role="status" aria-live="polite">
          <strong>Bộ nhớ trình duyệt đang gần đầy.</strong>
          <span>
            Shime ước tính bộ nhớ trình duyệt đã dùng khoảng {storageQuotaWarning.percent}% dung lượng được báo cáo.
            Hãy tạo file sao lưu để bảo vệ dữ liệu học của bạn. Shime vẫn lưu dữ liệu trên thiết bị này; cảnh báo này không đồng bộ dữ liệu lên cloud.
          </span>
        </div>
      ) : null}

      <p className="muted" id="web-share-fallback-note">
        {webShareAvailable
          ? 'Nếu thiết bị hoặc trình duyệt hỗ trợ chia sẻ file, Chia sẻ file sao lưu sẽ mở bảng chia sẻ native/browser. Nếu navigator.canShare không hỗ trợ file này hoặc quá trình chia sẻ bị hủy/thất bại, hãy dùng nút Sao lưu dữ liệu để tải file sao lưu.'
          : 'Trình duyệt này chưa hỗ trợ navigator.share cho chia sẻ file sao lưu trực tiếp. Bạn vẫn có thể dùng Sao lưu dữ liệu để tải file xuống rồi gửi bằng nơi bạn tin tưởng.'}
      </p>
      <p className="muted">
        Việc chia sẻ này không tải dữ liệu lên máy chủ Shime và không tạo đồng bộ đám mây tự động. File sao lưu có thể chứa nội dung quiz, câu trả lời, tiến độ và lịch sử học; chỉ chia sẻ tới nơi bạn tin tưởng.
      </p>

      <p className="muted">
        Transfer helper labels: Save backup file, Restore from backup, Receive data, and Move my quizzes to this device all refer to this same manual backup file flow.
      </p>

      {lastBackupSize ? (
        <p className="muted backupSizeHint">
          Kích thước sao lưu gần nhất khoảng {Math.ceil(lastBackupSize.totalBytes / 1024)} KB.
        </p>
      ) : null}

      <div className="sourceSummaryGrid" aria-label="Nội dung sao lưu">
        <span><strong>{librarySummary.subjectCount}</strong> môn học</span>
        <span><strong>{librarySummary.topicCount}</strong> chủ đề</span>
        <span><strong>{librarySummary.itemCount}</strong> mục học</span>
      </div>

      <fieldset className="backupModeChooser">
        <legend>Loại sao lưu</legend>
        {backupModeOptions.map(option => (
          <label key={option.value} className="backupModeOption">
            <input
              type="radio"
              name="v2BackupMode"
              value={option.value}
              checked={backupMode === option.value}
              onChange={() => setBackupMode(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="backupActions">
        <Button type="button" onClick={exportBackup} loading={isExporting}>
          Sao lưu dữ liệu
        </Button>
        {webShareAvailable ? (
          <Button
            type="button"
            variant="secondary"
            onClick={shareBackup}
            loading={isSharing}
            aria-describedby="web-share-fallback-note"
          >
            Chia sẻ file sao lưu
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={openRestoreFilePicker} loading={isReading}>
          Khôi phục từ file sao lưu
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="srOnly"
        onChange={handleRestoreFile}
        aria-label="Chọn file sao lưu"
      />

      {status ? <Toast tone={status.tone} title={status.title} description={status.description} /> : null}

      <RestorePreview
        preview={preview}
        fileName={fileName}
        onApply={applyRestore}
        onCancel={resetRestorePreview}
        isRestoring={isRestoring}
      />
    </Card>
  );
}
