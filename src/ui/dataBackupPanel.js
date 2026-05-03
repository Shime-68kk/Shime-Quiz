import {
  createBackupPayload,
  downloadBackupFile,
  parseBackupText,
  restoreBackupData,
  validateBackupPayload
} from '../quiz/dataBackup.js';
import { showToast } from './toast.js';

let initialized = false;

function setStatus(message, type = '') {
  const status = document.getElementById('backupStatus');
  if (!status) return;
  status.textContent = message || '';
  status.classList.toggle('is-error', type === 'error');
  status.classList.toggle('is-success', type === 'success');
}

function formatImportSummary(summary) {
  return [
    `${summary.historyCount} lịch sử`,
    `${summary.reviewCount} câu ôn tập`,
    `${summary.bookmarkCount || 0} câu đã lưu`,
    `${summary.collectionCount || 0} bộ sưu tập`,
    `${summary.recommendationFeedbackCount || 0} phản hồi gợi ý`,
    `${summary.mistakeCount || 0} lỗi sai`,
    summary.hasStudyGoal ? 'có mục tiêu học tập' : 'không có mục tiêu học tập',
    summary.hasStudySession ? 'có buổi học hôm nay' : 'không có buổi học hôm nay',
    `${summary.studySessionCompletionCount || 0} tổng kết buổi học`,
    summary.hasProgress ? 'có tiến độ đang làm' : 'không có tiến độ đang làm'
  ].join(' · ');
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không đọc được file sao lưu.'));
    reader.readAsText(file, 'utf-8');
  });
}

export function initDataBackupPanel({ onRestored } = {}) {
  if (initialized) return;
  initialized = true;

  const exportButton = document.getElementById('btnExportData');
  const importButton = document.getElementById('btnImportData');
  const input = document.getElementById('backupInput');

  exportButton?.addEventListener('click', () => {
    try {
      downloadBackupFile(createBackupPayload());
      setStatus('Đã xuất dữ liệu học tập.', 'success');
      showToast('Đã xuất dữ liệu học tập.', { type: 'success' });
    } catch {
      setStatus('Không thể xuất dữ liệu. Vui lòng thử lại.', 'error');
      showToast('Không thể xuất dữ liệu. Vui lòng thử lại.', { type: 'error' });
    }
  });

  importButton?.addEventListener('click', () => {
    input?.click();
  });

  input?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const parsed = parseBackupText(text);
      const validation = validateBackupPayload(parsed);

      if (!validation.ok) {
        setStatus(`Không thể nhập dữ liệu: ${validation.errors.join(' ')}`, 'error');
        showToast('Không thể nhập dữ liệu. File sao lưu không đúng cấu trúc.', { type: 'error', timeout: 7000 });
        return;
      }

      const summary = formatImportSummary(validation.summary);
      if (!confirm(`Khôi phục dữ liệu từ file này?\n\n${summary}\n\nDữ liệu học tập hiện tại sẽ bị ghi đè.`)) {
        setStatus('Đã hủy nhập dữ liệu.');
        showToast('Đã hủy nhập dữ liệu.', { type: 'info' });
        return;
      }

      restoreBackupData(validation.data);
      setStatus('Đã nhập dữ liệu thành công.', 'success');
      showToast('Đã nhập dữ liệu thành công.', { type: 'success' });
      onRestored?.();
    } catch (error) {
      setStatus(error?.message || 'Không thể nhập dữ liệu. File có thể bị lỗi.', 'error');
      showToast(error?.message || 'Không thể nhập dữ liệu. File có thể bị lỗi.', { type: 'error', timeout: 7000 });
    } finally {
      event.target.value = '';
    }
  });
}
