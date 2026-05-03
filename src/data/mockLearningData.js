const mockLearningData = {
  version: 'v2-mock-0.1',
  subjects: [
    {
      id: 'subject-ptit-networking',
      title: 'Mạng máy tính',
      description: 'Nền tảng mạng, mô hình OSI/TCP-IP và các giao thức thường gặp.',
      courses: [
        {
          id: 'course-networking-foundations',
          title: 'Cơ sở mạng',
          description: 'Các chủ đề nhập môn cho sinh viên công nghệ thông tin.'
        }
      ]
    },
    {
      id: 'subject-learning-english',
      title: 'Tiếng Anh học thuật',
      description: 'Từ vựng, khái niệm và phản xạ ngắn dùng trong học tập.',
      courses: [
        {
          id: 'course-academic-english',
          title: 'Academic English',
          description: 'Bộ học liệu mẫu cho từ vựng và câu trả lời ngắn.'
        }
      ]
    }
  ],
  topics: [
    {
      id: 'topic-osi-model',
      subjectId: 'subject-ptit-networking',
      courseId: 'course-networking-foundations',
      title: 'Mô hình OSI',
      description: 'Các tầng trong mô hình OSI và vai trò của từng tầng.'
    },
    {
      id: 'topic-ip-addressing',
      subjectId: 'subject-ptit-networking',
      courseId: 'course-networking-foundations',
      title: 'Địa chỉ IP',
      description: 'Khái niệm IPv4, subnet và định tuyến cơ bản.'
    },
    {
      id: 'topic-academic-vocabulary',
      subjectId: 'subject-learning-english',
      courseId: 'course-academic-english',
      title: 'Từ vựng học thuật',
      description: 'Nhóm từ thường dùng trong bài đọc và bài giảng.'
    },
    {
      id: 'topic-short-responses',
      subjectId: 'subject-learning-english',
      courseId: 'course-academic-english',
      title: 'Câu trả lời ngắn',
      description: 'Luyện phản hồi ngắn, rõ ý trong bối cảnh học tập.'
    }
  ],
  items: [
    {
      id: 'item-osi-application-layer',
      type: 'multiple_choice',
      subjectId: 'subject-ptit-networking',
      topicId: 'topic-osi-model',
      prompt: 'Tầng nào của mô hình OSI gần với ứng dụng người dùng nhất?',
      choices: [
        { id: 'a', text: 'Physical' },
        { id: 'b', text: 'Network' },
        { id: 'c', text: 'Application' },
        { id: 'd', text: 'Data Link' }
      ],
      correctAnswer: 'c',
      explanation: 'Application là tầng cung cấp giao diện gần nhất cho phần mềm người dùng.',
      tags: ['osi', 'networking'],
      difficulty: 'easy',
      source: 'mock-v2'
    },
    {
      id: 'item-osi-transport-flashcard',
      type: 'flashcard',
      subjectId: 'subject-ptit-networking',
      topicId: 'topic-osi-model',
      prompt: 'Transport layer chịu trách nhiệm chính về điều gì?',
      answer: 'Truyền dữ liệu đầu cuối, kiểm soát luồng và độ tin cậy khi cần.',
      explanation: 'TCP là ví dụ điển hình cho dịch vụ tin cậy ở tầng Transport.',
      tags: ['osi', 'transport'],
      difficulty: 'medium',
      source: 'mock-v2'
    },
    {
      id: 'item-ip-private-range',
      type: 'multiple_choice',
      subjectId: 'subject-ptit-networking',
      topicId: 'topic-ip-addressing',
      prompt: 'Dải nào sau đây là địa chỉ IPv4 private?',
      choices: [
        { id: 'a', text: '8.8.8.8/32' },
        { id: 'b', text: '10.0.0.0/8' },
        { id: 'c', text: '1.1.1.1/32' },
        { id: 'd', text: '224.0.0.0/4' }
      ],
      correctAnswer: 'b',
      explanation: '10.0.0.0/8 là một trong các dải private IPv4 theo RFC 1918.',
      tags: ['ipv4', 'subnet'],
      difficulty: 'easy',
      source: 'mock-v2'
    },
    {
      id: 'item-ip-subnet-short-answer',
      type: 'short_answer',
      subjectId: 'subject-ptit-networking',
      topicId: 'topic-ip-addressing',
      prompt: 'Viết dạng CIDR của subnet mask 255.255.255.0.',
      correctAnswer: '/24',
      explanation: '255.255.255.0 có 24 bit mạng.',
      tags: ['ipv4', 'cidr'],
      difficulty: 'medium',
      source: 'mock-v2'
    },
    {
      id: 'item-academic-define-analyze',
      type: 'flashcard',
      subjectId: 'subject-learning-english',
      topicId: 'topic-academic-vocabulary',
      prompt: 'Analyze',
      answer: 'To examine something carefully by separating it into parts.',
      explanation: 'Common in academic prompts: analyze, compare, evaluate.',
      tags: ['vocabulary', 'academic'],
      difficulty: 'easy',
      source: 'mock-v2'
    },
    {
      id: 'item-academic-evidence-mc',
      type: 'multiple_choice',
      subjectId: 'subject-learning-english',
      topicId: 'topic-academic-vocabulary',
      prompt: 'Which word best means “proof or support for an idea”?',
      choices: [
        { id: 'a', text: 'Evidence' },
        { id: 'b', text: 'Audience' },
        { id: 'c', text: 'Schedule' },
        { id: 'd', text: 'Method' }
      ],
      correctAnswer: 'a',
      explanation: 'Evidence supports a claim or conclusion.',
      tags: ['vocabulary'],
      difficulty: 'easy',
      source: 'mock-v2'
    },
    {
      id: 'item-short-response-clarify',
      type: 'short_answer',
      subjectId: 'subject-learning-english',
      topicId: 'topic-short-responses',
      prompt: 'Write a short phrase to ask someone to explain again politely.',
      correctAnswer: 'Could you clarify that?',
      explanation: 'Other polite answers are acceptable in real scoring, but this is mock data only.',
      tags: ['speaking', 'clarification'],
      difficulty: 'medium',
      source: 'mock-v2'
    }
  ]
};

export default mockLearningData;
