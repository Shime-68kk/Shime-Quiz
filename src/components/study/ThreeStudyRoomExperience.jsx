import { useState, useRef, Suspense, lazy } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import Badge from '../Badge.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { animateOptionClick, animateAnswerFeedback } from '../../uiMotion/gsapQuizAnimations.js';

const ThreeCss3dFlipCard = lazy(() => import('../vfx/ThreeCss3dFlipCard.jsx'));
const ThreeConfettiCelebration = lazy(() => import('../vfx/ThreeConfettiCelebration.jsx'));
const ThreeShaderTransitionCurtain = lazy(() => import('../vfx/ThreeShaderTransitionCurtain.jsx'));

const QUIZ_ITEMS = [
  {
    id: 'item-1',
    type: 'flashcard',
    topic: 'Cơ chế 3D WebGL',
    prompt: 'Làm thế nào để Three.js hiển thị chữ và form HTML sắc nét trong không gian 3D?',
    answer: 'Sử dụng CSS3DRenderer và CSS3DObject để biến DOM element thật thành đối tượng 3D với toạ độ ma trận CSS 3D Transforms mà không qua rasterize pixel.',
    tip: 'Bấm nút "Lật thẻ" bên dưới hoặc rê chuột để quan sát hiệu ứng Parallax Tilt 3D.'
  },
  {
    id: 'item-2',
    type: 'multiple_choice',
    topic: 'Quản trị bộ nhớ GPU',
    prompt: 'Kỹ thuật cốt lõi nào giúp ngăn chặn rò rỉ VRAM (Memory Leak) khi huỷ bỏ Three.js Scene trong React?',
    choices: [
      { id: 'a', text: 'Chỉ cần gán scene = null' },
      { id: 'b', text: 'Duyệt đệ quy (traverse) gọi .dispose() trên mọi Geometry, Material, Texture và forceContextLoss()' },
      { id: 'c', text: 'Tải lại toàn bộ trang web' },
      { id: 'd', text: 'Tăng dung lượng RAM máy chủ' }
    ],
    correctAnswer: 'b',
    explanation: 'WebGL ngữ cảnh được quản lý trực tiếp trên GPU. Gán null trong JS không giải phóng VRAM; phải gọi dispose() và forceContextLoss() qua threeCoreGuard.'
  },
  {
    id: 'item-3',
    type: 'multiple_choice',
    topic: 'Hiệu năng Chuyển cảnh',
    prompt: 'Trong Three.js Shader Transition, kỹ thuật RenderTransitionPass sử dụng thành phần nào để tạo hiệu ứng hoà tan (dissolve)?',
    choices: [
      { id: 'a', text: 'File GIF quay sẵn' },
      { id: 'b', text: 'CSS transform translateX' },
      { id: 'c', text: 'Grayscale Noise Texture kết hợp ngưỡng Threshold trong Fragment Shader' },
      { id: 'd', text: 'Thư viện Canvas 2D bên ngoài' }
    ],
    correctAnswer: 'c',
    explanation: 'Shader đọc kênh màu đỏ (r) của texture mặt nạ xám và so sánh với giá trị mixRatio để tạo đường biên cắt tỉa mượt mà.'
  }
];

/**
 * Phòng Học Trải Nghiệm 3D Cao Cấp (Three.js 3D Study Room Experience)
 * Tích hợp toàn diện: Thẻ lật 3D không gian, GSAP micro-interactions, Chuyển cảnh WebGL Shader và Pháo hoa 3D GPU.
 */
export default function ThreeStudyRoomExperience() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeShaderTransition, setActiveShaderTransition] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const choiceRefs = useRef({});
  const feedbackRef = useRef(null);

  const currentItem = QUIZ_ITEMS[currentIndex];
  const totalItems = QUIZ_ITEMS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalItems) * 100);

  const handleSelectChoice = (choiceId) => {
    if (isChecked) return;
    setSelectedChoiceId(choiceId);
    const el = choiceRefs.current[choiceId];
    if (el) animateOptionClick(el);
  };

  const handleCheckAnswer = () => {
    if (!selectedChoiceId || isChecked) return;
    setIsChecked(true);

    const isCorrect = selectedChoiceId === currentItem.correctAnswer;
    const selectedEl = choiceRefs.current[selectedChoiceId];
    const correctEl = choiceRefs.current[currentItem.correctAnswer];

    setTimeout(() => {
      animateAnswerFeedback({
        selectedOptionEl: selectedEl,
        isCorrect,
        feedbackEl: feedbackRef.current,
        correctOptionEl: correctEl
      });
    }, 20);
  };

  const handleNext = () => {
    // Kích hoạt chuyển cảnh WebGL Shader trước khi sang câu kế tiếp
    setActiveShaderTransition(true);

    setTimeout(() => {
      if (currentIndex < totalItems - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedChoiceId('');
        setIsChecked(false);
        setIsFlipped(false);
      } else {
        setIsCompleted(true);
        setShowCelebration(true); // Bắn pháo hoa 3D khi hoàn thành bài
      }
    }, 450);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoiceId('');
    setIsChecked(false);
    setIsFlipped(false);
    setIsCompleted(false);
    setShowCelebration(false);
  };

  const isCurrentCorrect = isChecked && selectedChoiceId === currentItem?.correctAnswer;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
      {/* ─── THANH TIẾN ĐỘ & HEADER ─── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--theme-text-muted)' }}>
            Chế độ: <strong>Phòng Học Không Gian 3D (Three.js VFX)</strong>
          </span>
          <Badge tone="info">Câu {currentIndex + 1} / {totalItems}</Badge>
        </div>
        <ProgressBar value={progressPercent} label={`Tiến độ ${progressPercent}%`} />
      </div>

      {/* ─── NẾU HOÀN THÀNH: MÀN HÌNH TỔNG KẾT & PHÁO HOA 3D ─── */}
      {isCompleted ? (
        <Card variant="elevated" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <Badge tone="success">Xuất Sắc!</Badge>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.75rem 0' }}>
            Chúc mừng bạn đã hoàn thành phiên học 3D!
          </h3>
          <p style={{ color: 'var(--theme-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Hiệu ứng pháo hoa hạt 3D GPU đang được bắn mừng chiến thắng của bạn.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button type="button" variant="primary" onClick={handleRestart}>
              Học lại từ đầu
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowCelebration(true)}>
              🎉 Bắn thêm pháo hoa 3D
            </Button>
          </div>
        </Card>
      ) : (
        /* ─── THẺ CÂU HỎI 3D THỰC ─── */
        <div>
          <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Đang nạp Three.js 3D Viewport...</p>}>
            <ThreeCss3dFlipCard
              isFlipped={isFlipped}
              enableTilt={true}
              frontContent={
                <Card variant="elevated" style={{ padding: '1.5rem', minHeight: '320px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <Badge tone="neutral">{currentItem.topic}</Badge>
                    <Badge tone={currentItem.type === 'flashcard' ? 'success' : 'info'}>
                      {currentItem.type === 'flashcard' ? 'Thẻ Flashcard 3D' : 'Trắc nghiệm'}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {currentItem.prompt}
                  </h3>

                  {/* LOẠI 1: FLASHCARD 3D */}
                  {currentItem.type === 'flashcard' && (
                    <div>
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px dashed rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        marginBottom: '1.25rem',
                        fontSize: '0.9rem',
                        color: 'var(--theme-text-muted)'
                      }}>
                        💡 {currentItem.tip}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button type="button" variant="primary" onClick={() => setIsFlipped(true)}>
                          🔄 Lật Xem Mặt Sau (3D Flip)
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleNext}>
                          Câu tiếp theo →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* LOẠI 2: TRẮC NGHIỆM */}
                  {currentItem.type === 'multiple_choice' && (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        {currentItem.choices.map((choice, i) => {
                          const isSelected = selectedChoiceId === choice.id;
                          const isChoiceCorrect = isChecked && choice.id === currentItem.correctAnswer;
                          const isChoiceWrong = isChecked && isSelected && !isChoiceCorrect;

                          return (
                            <div
                              key={choice.id}
                              ref={el => { choiceRefs.current[choice.id] = el; }}
                              onClick={() => handleSelectChoice(choice.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                border: '1px solid',
                                borderColor: isChoiceCorrect
                                  ? 'var(--theme-status-safe, #10b981)'
                                  : isChoiceWrong
                                  ? 'var(--theme-status-danger, #ef4444)'
                                  : isSelected
                                  ? 'var(--theme-accent, #38bdf8)'
                                  : 'var(--theme-border, rgba(255,255,255,0.15))',
                                borderRadius: '8px',
                                cursor: isChecked ? 'default' : 'pointer',
                                backgroundColor: isChoiceCorrect
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : isChoiceWrong
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : isSelected
                                  ? 'rgba(56, 189, 248, 0.12)'
                                  : 'var(--theme-bg-surface, rgba(255,255,255,0.03))'
                              }}
                            >
                              <span style={{
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span style={{ flex: 1, fontSize: '0.9rem' }}>{choice.text}</span>
                              {isChoiceCorrect && <Badge tone="success">✓ Đúng</Badge>}
                              {isChoiceWrong && <Badge tone="danger">✗ Sai</Badge>}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleCheckAnswer}
                          disabled={!selectedChoiceId || isChecked}
                        >
                          Kiểm tra
                        </Button>
                        {isChecked && (
                          <Button type="button" variant="secondary" onClick={handleNext}>
                            {currentIndex === totalItems - 1 ? 'Hoàn thành bài thi' : 'Câu tiếp theo →'}
                          </Button>
                        )}
                      </div>

                      {isChecked && (
                        <div
                          ref={feedbackRef}
                          style={{
                            marginTop: '1.25rem',
                            padding: '0.9rem 1.1rem',
                            borderRadius: '8px',
                            backgroundColor: isCurrentCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            borderLeft: `4px solid ${isCurrentCorrect ? '#10b981' : '#ef4444'}`
                          }}
                        >
                          <strong>{isCurrentCorrect ? '🎉 Tuyệt vời! Bạn trả lời chính xác.' : '⚠️ Chưa đúng!'}</strong>
                          <p style={{ marginTop: '0.4rem', fontSize: '0.88rem', lineHeight: '1.4' }}>
                            {currentItem.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              }
              backContent={
                currentItem.type === 'flashcard' ? (
                  <Card variant="elevated" style={{
                    padding: '1.5rem',
                    minHeight: '320px',
                    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#fff'
                  }}>
                    <Badge tone="success">Mặt sau Thẻ Flashcard 3D</Badge>
                    <h4 style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#6ee7b7' }}>
                      Nội dung ghi nhớ cốt lõi:
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginTop: '0.75rem', color: '#ecfdf5' }}>
                      {currentItem.answer}
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                      <Button type="button" onClick={() => setIsFlipped(false)}>
                        🔄 Lật lại mặt câu hỏi
                      </Button>
                      <Button type="button" variant="primary" onClick={handleNext}>
                        Đã nhớ · Câu kế tiếp →
                      </Button>
                    </div>
                  </Card>
                ) : null
              }
            />
          </Suspense>
        </div>
      )}

      {/* ─── PHÁO HOA 3D GPU KHI HOÀN THÀNH ─── */}
      {showCelebration && (
        <Suspense fallback={null}>
          <ThreeConfettiCelebration
            particleCount={180}
            onComplete={() => setShowCelebration(false)}
          />
        </Suspense>
      )}

      {/* ─── MÀN CHUYỂN CẢNH WEBGL SHADER KHI QUA CÂU ─── */}
      {activeShaderTransition && (
        <Suspense fallback={null}>
          <ThreeShaderTransitionCurtain
            active={activeShaderTransition}
            textureIndex={2} // Cellular dissolve
            duration={700}
            onComplete={() => setActiveShaderTransition(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
