import { useState, Suspense, lazy } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import FsrsTwoStepScaffold from '../components/study/FsrsTwoStepScaffold.jsx';
import GsapQuizDemo from '../components/study/GsapQuizDemo.jsx';

const ThreeStudyRoomExperience = lazy(() => import('../components/study/ThreeStudyRoomExperience.jsx'));
const ThreeVfxShowcasePanel = lazy(() => import('../components/dev/ThreeVfxShowcasePanel.jsx'));

export default function FsrsUiFixture() {
  const [activeTab, setActiveTab] = useState('3d-room');

  return (
    <div className="pageRoot">
      <PageHeader
        title="Developer VFX & FSRS Lab"
        subtitle="Three.js 3D Transitions · GSAP Animations · FSRS Scaffolding"
      />

      {/* Thanh chuyển đổi chế độ trải nghiệm */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--theme-border, rgba(255,255,255,0.1))',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: '3d-room', label: '🎮 Phòng Học 3D (Three.js Experience)' },
          { id: '3d-studio', label: '✨ Studio 3D VFX Showcase' },
          { id: 'gsap-quiz', label: '🎯 GSAP Quiz Demo' },
          { id: 'fsrs-scaffold', label: '⚙️ FSRS Core Scaffold' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === tab.id ? '#38bdf8' : 'inherit',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === '3d-room' && (
        <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Đang nạp Phòng học 3D...</p>}>
          <ThreeStudyRoomExperience />
        </Suspense>
      )}

      {activeTab === '3d-studio' && (
        <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Đang nạp Three.js VFX Studio...</p>}>
          <ThreeVfxShowcasePanel />
        </Suspense>
      )}

      {activeTab === 'gsap-quiz' && (
        <div style={{ marginBottom: '2rem' }}>
          <GsapQuizDemo />
        </div>
      )}

      {activeTab === 'fsrs-scaffold' && (
        <FsrsTwoStepScaffold />
      )}
    </div>
  );
}



