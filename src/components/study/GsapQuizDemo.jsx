import { useState, useRef, useEffect } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import Badge from '../Badge.jsx';
import {
  animateQuestionIn,
  animateAnswerFeedback,
  animateProgressBar,
  animateOptionClick
} from '../../uiMotion/gsapQuizAnimations.js';

const DEMO_QUESTIONS = [
  {
    id: 'q1',
    prompt: 'Thư viện GSAP là viết tắt của cụm từ nào?',
    choices: [
      { id: '1', text: 'GreenSock Animation Platform' },
      { id: '2', text: 'Global Standard Animation Protocol' },
      { id: '3', text: 'Graphical Styling & Animation Package' },
      { id: '4', text: 'General Scripting Animation Plugin' }
    ],
    correctAnswer: '1',
    explanation: 'GSAP là viết tắt của GreenSock Animation Platform, một trong những thư viện JavaScript animation mạnh mẽ và mượt mà nhất hiện nay.'
  },
  {
    id: 'q2',
    prompt: 'Phương thức nào trong GSAP 3 giúp dọn dẹp (cleanup) animation trong React hiệu quả nhất?',
    choices: [
      { id: '1', text: 'gsap.clear()' },
      { id: '2', text: 'gsap.context() với ctx.revert()' },
      { id: '3', text: 'gsap.destroyAll()' },
      { id: '4', text: 'window.removeEventListener()' }
    ],
    correctAnswer: '2',
    explanation: 'gsap.context() được giới thiệu từ GSAP 3.11, cho phép gom nhóm và dọn sạch toàn bộ tween/timeline trong hook useEffect của React.'
  },
  {
    id: 'q3',
    prompt: 'Thuộc tính CSS nào nên ưu tiên animate để đạt hiệu năng 60fps tốt nhất?',
    choices: [
      { id: '1', text: 'width và height' },
      { id: '2', text: 'top, left, bottom, right' },
      { id: '3', text: 'transform và opacity' },
      { id: '4', text: 'margin và padding' }
    ],
    correctAnswer: '3',
    explanation: 'Transform và opacity được xử lý trực tiếp trên GPU (Composite layer) mà không kích hoạt layout thrashing hay repaint.'
  }
];

export default function GsapQuizDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  // Refs cho animation
  const cardRef = useRef(null);
  const progressFillRef = useRef(null);
  const progressCounterRef = useRef(null);
  const feedbackRef = useRef(null);
  const choiceRefs = useRef({});
  const prevProgressRef = useRef(0);

  const currentQuestion = DEMO_QUESTIONS[currentIndex];
  const totalQuestions = DEMO_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // 1. Kích hoạt hiệu ứng Chuyển câu hỏi khi currentIndex thay đổi
  useEffect(() => {
    if (cardRef.current) {
      animateQuestionIn(cardRef.current, {
        direction: 'next',
        duration: 0.35,
        staggerOptions: true
      });
    }
  }, [currentIndex]);

  // 2. Kích hoạt hiệu ứng Thanh tiến độ khi chuyển câu
  useEffect(() => {
    if (progressFillRef.current) {
      animateProgressBar({
        fillEl: progressFillRef.current,
        counterEl: progressCounterRef.current,
        fromPercent: prevProgressRef.current,
        toPercent: progressPercent,
        duration: 0.4
      });
      prevProgressRef.current = progressPercent;
    }
  }, [progressPercent]);

  // Xử lý khi click chọn phương án
  const handleSelectChoice = (choiceId) => {
    if (isChecked) return; // Đã check thì không đổi
    setSelectedChoiceId(choiceId);
    
    // Hiệu ứng micro-interaction khi bấm nút
    const el = choiceRefs.current[choiceId];
    if (el) {
      animateOptionClick(el);
    }
  };

  // 3. Xử lý khi bấm nút "Kiểm tra đáp án"
  const handleCheckAnswer = () => {
    if (!selectedChoiceId || isChecked) return;
    setIsChecked(true);

    const isCorrect = selectedChoiceId === currentQuestion.correctAnswer;
    const selectedEl = choiceRefs.current[selectedChoiceId];
    const correctEl = choiceRefs.current[currentQuestion.correctAnswer];

    // Chờ DOM cập nhật khung feedback rồi gọi animation
    setTimeout(() => {
      animateAnswerFeedback({
        selectedOptionEl: selectedEl,
        isCorrect,
        feedbackEl: feedbackRef.current,
        correctOptionEl: correctEl
      });
    }, 20);
  };

  // Chuyển sang câu tiếp theo
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoiceId('');
      setIsChecked(false);
    }
  };

  // Quay lại câu trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedChoiceId('');
      setIsChecked(false);
    }
  };

  // Làm lại từ đầu
  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedChoiceId('');
    setIsChecked(false);
  };

  const isCurrentCorrect = isChecked && selectedChoiceId === currentQuestion.correctAnswer;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          GSAP Interactive Quiz Demo
        </h2>
        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>
          Mẫu tích hợp GSAP: Chuyển câu hỏi, Feedback Đúng/Sai, và Thanh tiến độ
        </p>
      </div>

      {/* ─── 1. THANH TIẾN ĐỘ VỚI GSAP ─── */}
      <div className="progressBlock" style={{ marginBottom: '1.5rem' }}>
        <div className="progressBlock__meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Tiến độ học: Câu {currentIndex + 1} / {totalQuestions}</span>
          <strong ref={progressCounterRef}>{progressPercent}%</strong>
        </div>
        <div
          className="progressBar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progressPercent}
          style={{
            height: '10px',
            backgroundColor: 'var(--theme-bg-muted, rgba(255,255,255,0.1))',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <span
            ref={progressFillRef}
            className="progressBar__fill"
            style={{
              display: 'block',
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 100%)',
              borderRadius: '999px'
            }}
          />
        </div>
      </div>

      {/* ─── 2. KHUNG CÂU HỎI VỚI GSAP TRANSITION ─── */}
      <div ref={cardRef}>
        <Card variant="elevated" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Badge tone="info">Câu {currentIndex + 1}</Badge>
            <Badge tone="neutral">Trắc nghiệm</Badge>
          </div>

          <h3 style={{ fontSize: '1.2rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            {currentQuestion.prompt}
          </h3>

          {/* Danh sách phương án lựa chọn */}
          <div className="choiceList" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQuestion.choices.map((choice, index) => {
              const choiceId = choice.id;
              const isSelected = selectedChoiceId === choiceId;
              const isChoiceCorrect = isChecked && choiceId === currentQuestion.correctAnswer;
              const isChoiceWrong = isChecked && isSelected && !isChoiceCorrect;

              return (
                <div
                  key={choiceId}
                  ref={el => { choiceRefs.current[choiceId] = el; }}
                  onClick={() => handleSelectChoice(choiceId)}
                  className={[
                    'choiceOption',
                    isSelected ? 'choiceOption--selected' : '',
                    isChoiceCorrect ? 'choiceOption--correct' : '',
                    isChoiceWrong ? 'choiceOption--wrong' : ''
                  ].filter(Boolean).join(' ')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    border: '1px solid',
                    borderColor: isChoiceCorrect
                      ? 'var(--theme-status-safe, #10b981)'
                      : isChoiceWrong
                      ? 'var(--theme-status-danger, #ef4444)'
                      : isSelected
                      ? 'var(--theme-accent, #3b82f6)'
                      : 'var(--theme-border, rgba(255,255,255,0.15))',
                    borderRadius: '8px',
                    cursor: isChecked ? 'default' : 'pointer',
                    backgroundColor: isChoiceCorrect
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isChoiceWrong
                      ? 'rgba(239, 68, 68, 0.12)'
                      : isSelected
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'var(--theme-bg-surface, rgba(255,255,255,0.03))',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={{ flex: 1 }}>{choice.text}</span>

                  {isChoiceCorrect && <Badge tone="success">✓ Đúng</Badge>}
                  {isChoiceWrong && <Badge tone="danger">✗ Sai</Badge>}
                </div>
              );
            })}
          </div>

          {/* Các nút hành động */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!selectedChoiceId || isChecked}
            >
              Kiểm tra
            </Button>
            {isChecked && currentIndex < totalQuestions - 1 && (
              <Button type="button" variant="primary" onClick={handleNext}>
                Câu tiếp theo →
              </Button>
            )}
            {isChecked && currentIndex === totalQuestions - 1 && (
              <Button type="button" variant="secondary" onClick={handleReset}>
                Hoàn thành · Làm lại
              </Button>
            )}
          </div>

          {/* ─── 3. KHUNG FEEDBACK KẾT QUẢ VỚI GSAP ─── */}
          {isChecked && (
            <div
              ref={feedbackRef}
              className={`studyFeedback ${isCurrentCorrect ? 'studyFeedback--success' : 'studyFeedback--danger'}`}
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: isCurrentCorrect
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                borderLeft: `4px solid ${isCurrentCorrect ? '#10b981' : '#ef4444'}`
              }}
            >
              <strong>{isCurrentCorrect ? '🎉 Chính xác! Bạn làm rất tốt.' : '⚠️ Chưa chính xác!'}</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Điều hướng thử nghiệm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}>
          ← Câu trước
        </Button>
        <Button variant="ghost" onClick={handleNext} disabled={currentIndex === totalQuestions - 1}>
          Câu sau →
        </Button>
      </div>
    </div>
  );
}
