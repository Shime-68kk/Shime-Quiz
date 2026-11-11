import { useState, Suspense, lazy } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import Badge from '../Badge.jsx';
import { isWebGLAvailable, getSafePixelRatio, isReducedMotionRequested } from '../../uiMotion/threeCoreGuard.js';

// Lazy-load các component Three.js để đảm bảo Code-splitting hoàn toàn
const ThreeConfettiCelebration = lazy(() => import('../vfx/ThreeConfettiCelebration.jsx'));
const ThreeCss3dFlipCard = lazy(() => import('../vfx/ThreeCss3dFlipCard.jsx'));
const ThreeShaderTransitionCurtain = lazy(() => import('../vfx/ThreeShaderTransitionCurtain.jsx'));

const SHADER_PRESETS = [
  { id: 1, name: '1. Gợn sóng (Wipe)' },
  { id: 2, name: '2. Hoà tan tế bào (Dissolve)' },
  { id: 3, name: '3. Quét chéo (Diagonal)' },
  { id: 4, name: '4. Đốm sáng vỡ (Fracture)' },
  { id: 5, name: '5. Tia năng lượng (Radial)' },
  { id: 6, name: '6. Ma trận số (Matrix)' }
];

export default function ThreeVfxShowcasePanel() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeShader, setActiveShader] = useState(false);
  const [selectedTextureIndex, setSelectedTextureIndex] = useState(2);
  const [confettiCount, setConfettiCount] = useState(160);

  const webglOk = isWebGLAvailable();
  const pixelRatio = getSafePixelRatio();
  const reducedMotion = isReducedMotionRequested();

  const handleTriggerConfetti = () => {
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 20);
  };

  const handleTriggerShader = () => {
    setActiveShader(false);
    setTimeout(() => setActiveShader(true), 20);
  };

  return (
    <Card variant="elevated" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
            Three.js High-End VFX & 3D Transitions Studio
          </h3>
          <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Bộ hiệu ứng 3D & Shader cao cấp nạp từ kỹ năng <code>threejs-quiz-vfx</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge tone={webglOk ? 'success' : 'danger'}>
            WebGL: {webglOk ? 'Sẵn sàng' : 'Không hỗ trợ'}
          </Badge>
          <Badge tone="neutral">Pixel Ratio: {pixelRatio}x</Badge>
          {reducedMotion && <Badge tone="warning">Reduced Motion: BẬT</Badge>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* ─── 1. THỬ NGHIỆM PHÁO HOA 3D GPU ─── */}
        <div style={{ padding: '1rem', border: '1px solid var(--theme-border, rgba(255,255,255,0.1))', borderRadius: '10px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            1. Pháo hoa Hạt 3D GPU (Confetti)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)', marginBottom: '1rem' }}>
            Hiệu ứng chúc mừng 100% GPU, xoay lật 3D theo trọng lực, tự động dọn dẹp VRAM sau 3.5s.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Số lượng hạt: {confettiCount}</label>
            <input
              type="range"
              min="50"
              max="300"
              step="25"
              value={confettiCount}
              onChange={e => setConfettiCount(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <Button type="button" variant="primary" onClick={handleTriggerConfetti}>
            🎉 Bắn Pháo Hoa 3D Ngay
          </Button>
        </div>

        {/* ─── 2. THỬ NGHIỆM CHUYỂN CẢNH WEBGL SHADER ─── */}
        <div style={{ padding: '1rem', border: '1px solid var(--theme-border, rgba(255,255,255,0.1))', borderRadius: '10px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            2. Màn Chuyển Cảnh WebGL Shader
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)', marginBottom: '0.75rem' }}>
            Shader hoà tan RenderTransitionPass kết hợp 6 textures chuyển cảnh nội bộ.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {SHADER_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedTextureIndex(preset.id)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: selectedTextureIndex === preset.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                  background: selectedTextureIndex === preset.id ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                  color: selectedTextureIndex === preset.id ? '#38bdf8' : 'inherit',
                  cursor: 'pointer'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={handleTriggerShader}>
            🎬 Chạy Thử Chuyển Cảnh (Texture {selectedTextureIndex})
          </Button>
        </div>
      </div>

      {/* ─── 3. THỬ NGHIỆM THẺ QUIZ LẬT 3D THỰC (CSS3D) ─── */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--theme-border, rgba(255,255,255,0.1))', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
              3. Thẻ Câu Hỏi Lật 3D Không Gian (CSS3DRenderer)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)', margin: '0.2rem 0 0' }}>
              Thẻ HTML thật có thể tương tác bình thường, lật 180° và tự nghiêng 3D (Tilt) khi rê chuột.
            </p>
          </div>
          <Button type="button" onClick={() => setIsCardFlipped(!isCardFlipped)}>
            🔄 {isCardFlipped ? 'Xem Mặt Câu Hỏi' : 'Lật Xem Đáp Án'}
          </Button>
        </div>

        <div style={{ height: '320px', position: 'relative' }}>
          <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Đang nạp Three.js CSS3D Engine...</p>}>
            <ThreeCss3dFlipCard
              isFlipped={isCardFlipped}
              enableTilt={true}
              frontContent={
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  minHeight: '260px',
                  color: '#fff'
                }}>
                  <Badge tone="info">Mặt trước: Câu hỏi Flashcard 3D</Badge>
                  <h4 style={{ fontSize: '1.15rem', marginTop: '1rem', marginBottom: '0.75rem' }}>
                    Spaced Repetition trong Shime Quiz hoạt động theo thuật toán nào?
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    (Rê chuột xung quanh để thấy hiệu ứng Parallax 3D Tilt, bấm nút "Lật Xem Đáp Án" để xoay lật 180°)
                  </p>
                </div>
              }
              backContent={
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  minHeight: '260px',
                  color: '#fff'
                }}>
                  <Badge tone="success">Mặt sau: Đáp án & Giải thích</Badge>
                  <h4 style={{ fontSize: '1.15rem', marginTop: '1rem', color: '#6ee7b7' }}>
                    Thuật toán FSRS v5 kết hợp SM-2 Baseline!
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', marginTop: '0.5rem', color: '#d1fae5' }}>
                    Hệ thống tính toán độc lập độ ổn định (Stability) và độ khó (Difficulty) để lên lịch ôn tập tối ưu cho từng người học.
                  </p>
                </div>
              }
            />
          </Suspense>
        </div>
      </div>

      {/* Hiệu ứng nổ pháo hoa dạng Overlay */}
      {showConfetti && (
        <Suspense fallback={null}>
          <ThreeConfettiCelebration
            particleCount={confettiCount}
            onComplete={() => setShowConfetti(false)}
          />
        </Suspense>
      )}

      {/* Hiệu ứng màn chuyển cảnh WebGL Shader */}
      {activeShader && (
        <Suspense fallback={null}>
          <ThreeShaderTransitionCurtain
            active={activeShader}
            textureIndex={selectedTextureIndex}
            duration={1100}
            onComplete={() => setActiveShader(false)}
          />
        </Suspense>
      )}
    </Card>
  );
}
