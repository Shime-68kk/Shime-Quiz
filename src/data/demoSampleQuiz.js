export const demoSampleQuiz = {
  version: 'v2-demo-quickstart',
  subjects: [
    { id: 'subject:demo-study-skills', title: 'Kỹ năng học tập', description: 'Bộ mẫu cục bộ, trung lập để thử nhanh Shime Quiz.' }
  ],
  topics: [
    { id: 'topic:demo-active-recall', subjectId: 'subject:demo-study-skills', title: 'Ôn tập chủ động', description: 'Ví dụ ngắn cho luồng xem trước, đánh giá chất lượng và xác nhận lưu.' }
  ],
  items: [
    {
      id: 'demo-quickstart-mcq-active-recall', type: 'multiple_choice', subjectId: 'subject:demo-study-skills', topicId: 'topic:demo-active-recall',
      prompt: 'Kỹ thuật nào giúp người học tự nhớ lại kiến thức thay vì chỉ đọc lại ghi chú?',
      choices: [{ id: 'A', text: 'Ôn tập chủ động' }, { id: 'B', text: 'Đọc lướt một lần' }, { id: 'C', text: 'Bỏ qua phần khó' }, { id: 'D', text: 'Chỉ xem đáp án' }],
      correctAnswer: 'A', explanation: 'Ôn tập chủ động yêu cầu người học tự gợi nhớ kiến thức, giúp phát hiện phần chưa hiểu rõ.', difficulty: 'cơ bản', source: 'in-app-demo-sample'
    },
    {
      id: 'demo-quickstart-mcq-spaced-review', type: 'multiple_choice', subjectId: 'subject:demo-study-skills', topicId: 'topic:demo-active-recall',
      prompt: 'Vì sao nên chia lịch ôn thành nhiều lần ngắn thay vì dồn vào một buổi duy nhất?',
      choices: [{ id: 'A', text: 'Để tránh phải xem lại bài' }, { id: 'B', text: 'Để tăng cơ hội củng cố trí nhớ theo thời gian' }, { id: 'C', text: 'Để bỏ qua phần giải thích' }, { id: 'D', text: 'Để giảm số câu hỏi cần học' }],
      correctAnswer: 'B', explanation: 'Ôn cách quãng giúp người học gặp lại nội dung nhiều lần ở các thời điểm khác nhau.', difficulty: 'cơ bản', source: 'in-app-demo-sample'
    },
    {
      id: 'demo-quickstart-short-preview-save', type: 'short_answer', subjectId: 'subject:demo-study-skills', topicId: 'topic:demo-active-recall',
      prompt: 'Shime yêu cầu người dùng làm gì trước khi lưu bản nháp import?', answer: 'xem trước và xác nhận lưu', correctAnswer: 'xem trước và xác nhận lưu',
      acceptableAnswers: ['xem trước và xác nhận lưu', 'preview và confirm save', 'review and confirm save'],
      explanation: 'Bản mẫu đi qua cùng luồng preview, đánh giá chất lượng và xác nhận lưu như các import khác.', difficulty: 'cơ bản', source: 'in-app-demo-sample'
    },
    {
      id: 'demo-quickstart-card-manual-ai', type: 'flashcard', subjectId: 'subject:demo-study-skills', topicId: 'topic:demo-active-recall', prompt: 'Manual AI workflow',
      front: 'Shime có tự gọi AI API khi dùng bộ mẫu này không?', back: 'Không. Đây là bộ mẫu cục bộ; người dùng vẫn tự xem trước, kiểm tra và xác nhận trước khi lưu.',
      answer: 'Không. Đây là bộ mẫu cục bộ; người dùng vẫn tự xem trước, kiểm tra và xác nhận trước khi lưu.', correctAnswer: 'Không. Đây là bộ mẫu cục bộ; người dùng vẫn tự xem trước, kiểm tra và xác nhận trước khi lưu.', source: 'in-app-demo-sample'
    }
  ]
};

export default demoSampleQuiz;
