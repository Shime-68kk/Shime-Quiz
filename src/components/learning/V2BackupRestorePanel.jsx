import { useRef, useState } from 'react';
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
    <Card title="Xem trước file sao lưu" eyebrow="Xem trước khôi phục" variant="elevated" className="backupPreview">
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
        Khôi phục chỉ ghi đè các khóa dữ liệu v2 được nhận diện. Dữ liệu trình duyệt khác và cache PWA không bị thay đổi.
      </p>

      <div className="backupActions">
        <Button type="button" onClick={onApply} disabled={!preview.ok || !restoreSupported} loading={isRestoring}>
          Khôi phục dữ liệu
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy
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
  const [isReading, setIsReading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupSize, setLastBackupSize] = useState(null);
  const [backupMode, setBackupMode] = useState(V2_BACKUP_MODES.FULL);

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
        title: downloadResult.ok ? 'Đã tạo file sao lưu' : 'Không thể tải file sao lưu',
        description: downloadResult.ok
          ? `Đã tải file ${backupModeLabels[backupMode] || 'sao lưu'}: ${filename}.`
          : downloadResult.message || 'Trình duyệt không cho phép tạo file tải xuống lúc này.'
      });
    } finally {
      setIsExporting(false);
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
        title: parsed.ok ? 'Đã đọc file sao lưu' : 'File sao lưu không hợp lệ',
        description: parsed.ok
          ? 'Hãy kiểm tra danh sách dữ liệu trước khi khôi phục.'
          : 'File bị lỗi hoặc không đúng định dạng sao lưu v2.'
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
    const confirmed = window.confirm('Dữ liệu v2 trong file sao lưu sẽ được khôi phục và có thể ghi đè dữ liệu hiện tại. Bạn có chắc chắn?');
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
        title: 'Khôi phục thành công',
        description: 'Dữ liệu v2 đã được khôi phục. Dashboard và thư viện sẽ tự cập nhật.'
      });
      resetRestorePreview();
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Card title="Sao lưu dữ liệu" eyebrow="Sao lưu v2" variant="elevated" className="backupRestoreCard">
      <p className="muted">
        Sao lưu gồm thư viện, lịch sử học, lịch ôn tập, phản hồi gợi ý, mục tiêu học tập và tiến trình kế hoạch. Bản nháp Phòng học không được sao lưu để tránh khôi phục phiên học đã cũ.
      </p>

      <div className="backupPlaintextNotice" role="note">
        <strong>Lưu ý bảo mật:</strong> Ứng dụng chạy cục bộ trên trình duyệt. Dữ liệu học và đáp án có thể tồn tại trong bộ nhớ trình duyệt hoặc file sao lưu. Không dùng chế độ này như một hệ thống chống gian lận tuyệt đối. File sao lưu đầy đủ là JSON văn bản thuần và có thể chứa đáp án đúng. Hãy lưu trữ cẩn thận.
      </div>

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
        <Button type="button" variant="secondary" onClick={openRestoreFilePicker} loading={isReading}>
          Chọn file sao lưu
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
