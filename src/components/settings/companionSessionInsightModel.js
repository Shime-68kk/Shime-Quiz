export function createCompanionSessionInsight(transcript = []) {
  const rejectedCount = transcript.filter(entry => entry.status === 'rejected').length;
  const blockedCount = transcript.filter(entry => String(entry.privacyStatus || '').includes('chặn')).length;
  const wrongCount = transcript.filter(entry => entry.eventType === 'answer_wrong').length;
  const errorCount = transcript.filter(entry => entry.eventType === 'bridge_error').length;
  const completeCount = transcript.filter(entry => entry.eventType === 'session_complete').length;

  if (blockedCount > 0 || rejectedCount > 0) {
    return {
      sessionMood: 'Trợ lý đang ưu tiên bảo vệ quyền riêng tư.',
      learningArc: 'Một số tín hiệu đã bị chặn nên không dùng để suy luận.',
      supportStyle: 'Phản hồi nên thật nhẹ và trung lập.',
      safetySummary: 'Lớp an toàn đã chặn dữ liệu không phù hợp.',
      privacySummary: 'Chỉ hiển thị trạng thái đã làm mờ/rút gọn.',
      nextBestCompanionBehavior: 'Giữ trạng thái trung lập và không gửi lệnh ra robot.'
    };
  }

  if (errorCount > 0) {
    return {
      sessionMood: 'Kết nối chưa ổn định.',
      learningArc: 'Trợ lý tạm dừng suy luận sâu và giữ trạng thái an toàn.',
      supportStyle: 'Giữ bình tĩnh, không gây nhiễu cho người học.',
      safetySummary: 'Kết nối chưa an toàn, trợ lý chuyển về trạng thái trung lập.',
      privacySummary: 'Không có nội dung học tập riêng tư được hiển thị.',
      nextBestCompanionBehavior: 'Duy trì trạng thái trung lập cho tới khi kết nối ổn định.'
    };
  }

  if (wrongCount >= 2) {
    return {
      sessionMood: 'Người học có dấu hiệu gặp khó.',
      learningArc: 'Nhịp học cần chậm lại để tránh tạo áp lực.',
      supportStyle: 'Nên phản hồi nhẹ nhàng và khuyến khích tiếp tục.',
      safetySummary: 'Không có tín hiệu rủi ro bị chặn.',
      privacySummary: 'Chỉ dùng dữ liệu đã làm mờ/rút gọn.',
      nextBestCompanionBehavior: 'Ưu tiên động viên nhẹ và nhắc tập trung.'
    };
  }

  return {
    sessionMood: completeCount > 0 ? 'Buổi học kết thúc tích cực.' : 'Trợ lý đang ưu tiên nhịp học bình tĩnh.',
    learningArc: 'Tín hiệu học tập đang ổn định.',
    supportStyle: 'Duy trì hỗ trợ yên tĩnh, không làm gián đoạn.',
    safetySummary: 'Không có tín hiệu an toàn bất thường.',
    privacySummary: 'Chỉ dùng dữ liệu đã làm mờ/rút gọn.',
    nextBestCompanionBehavior: completeCount > 0 ? 'Có thể hiển thị phản hồi chúc mừng nhẹ.' : 'Tiếp tục nhắc tập trung nhẹ nhàng.'
  };
}

export function insightContainsForbiddenData(insight = {}) {
  const serialized = JSON.stringify(insight);
  return ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'backupPayload'].some(key => serialized.includes(key));
}

