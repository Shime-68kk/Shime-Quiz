export function createShimeFusionManualQaChecklist() {
  return {
    checklistVersion: 'shime-fusion-manual-qa-v1',
    titleVi: 'Kiểm thử thủ công Shime Fusion — expression-only',
    productionClaim: false,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    items: [
      'Section D hiển thị trong Companion Dev Panel.',
      'Section D không tự chạy khi mở trang.',
      'Trạng thái rỗng hoạt động đúng.',
      'Kịch bản giả lập bình thường chạy được.',
      'Kịch bản người học gặp khó chạy được.',
      'Kịch bản dữ liệu nhạy cảm bị chặn hoặc trung hòa.',
      'Nhật ký live DeviceBridge observe-only chạy được nếu có dữ liệu.',
      'Kết quả Shime fusion hiển thị.',
      'Expression preview chỉ dry-run.',
      'Không có nút gửi.',
      'Không hiển thị nội dung thô.',
      'Xóa kết quả hoạt động.',
      'F5 reset kết quả trong bộ nhớ.',
      'Language switch vẫn hiển thị.',
      'V2 section vẫn hoạt động.',
      'StudyRoom không bị ảnh hưởng.',
      'DeviceBridge không bị ảnh hưởng.'
    ],
    sectionDTitleVi: 'D. Hệ sinh thái Shime — chạy thử khớp nối',
    runButtonVi: 'Chạy khớp nối Shime',
    clearButtonVi: 'Xóa kết quả khớp nối',
    reasonCodes: ['shime_fusion_manual_qa_checklist_created']
  };
}

export function summarizeShimeFusionManualQaChecklist(checklist = createShimeFusionManualQaChecklist()) {
  return {
    checklistVersion: checklist.checklistVersion,
    itemCount: checklist.items?.length || 0,
    sectionDTitleVi: checklist.sectionDTitleVi,
    dryRunOnly: checklist.dryRunOnly === true,
    sendStatus: checklist.sendStatus || 'not_sent',
    productionClaim: checklist.productionClaim === true ? 'invalid' : 'no_production_claim',
    reasonCodes: ['shime_fusion_manual_qa_checklist_summarized']
  };
}
