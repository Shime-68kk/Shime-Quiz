import Badge from '../Badge.jsx';
import { LARGE_IMPORT_ITEM_THRESHOLD } from '../../utils/storageQuotaEstimate.js';

export default function BackupBeforeImportNotice({ itemCount }) {
  const isLarge = typeof itemCount === 'number' && Number.isFinite(itemCount) && itemCount >= LARGE_IMPORT_ITEM_THRESHOLD;

  return (
    <div className="backupBeforeImportNotice" role="note" aria-label="Nhắc nhở sao lưu trước khi import">
      <Badge tone={isLarge ? 'warning' : 'info'}>Sao lưu trước khi import</Badge>
      <p>
        Shime lưu dữ liệu học tập <strong>cục bộ</strong> trong trình duyệt của bạn.
        {isLarge
          ? ` Import này có ${itemCount} mục học — nên xuất/sao lưu thư viện hiện tại trước khi xác nhận để giữ bản dự phòng.`
          : ' Trước khi import hoặc thay thế nhiều mục, hãy xuất/sao lưu thư viện của bạn để giữ bản dự phòng.'}
      </p>
      <p className="muted">
        Bản nháp EduGen luôn cần xem lại trước khi tin dùng. Import xem trước không thay đổi dữ liệu cho đến khi bạn xác nhận.
      </p>
    </div>
  );
}
