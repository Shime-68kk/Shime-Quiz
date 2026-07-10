import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import OverviewDisclosure from '../../src/components/learning/OverviewDisclosure.jsx';
import ShimeBrandMark from '../../src/components/brand/ShimeBrandMark.jsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const home = read('src/routes/Home.jsx');
const dashboard = read('src/routes/Dashboard.jsx');
const history = read('src/components/study/StudyHistoryPanel.jsx');
const summary = read('src/components/learning/OverviewLearnerSummary.jsx');
const disclosure = read('src/components/learning/OverviewDisclosure.jsx');
const appLayout = read('src/layout/AppLayout.jsx');
const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');
const tokens = read('src/design-system/tokens.css');
const css = read('src/styles/global.css');

describe('BIG-UPDATE-11 — concise Home contract', () => {
  it('shows exactly three learner benefits with inline SVG icons', () => {
    expect(home.match(/<article className="shimeLandingProofCard"/g)).toHaveLength(3);
    expect(home).toContain('Học cục bộ và riêng tư.');
    expect(home).toContain('Phòng học theo môn.');
    expect(home).toContain('Ôn đúng lúc trước khi quên.');
    expect(home).toContain('function BenefitIcon');
    expect(home).not.toContain('>Local</span>');
    expect(home).not.toContain('>Safe</span>');
  });

  it('adds a three-step flow and a short privacy trust statement', () => {
    expect(home).toContain('shimeLandingFlow__steps');
    expect(home.match(/<li><span>[123]<\/span>/g)).toHaveLength(3);
    expect(home).toContain('Dữ liệu học được giữ trên thiết bị của bạn.');
    expect(home).toContain('không nhận nội dung câu hỏi');
  });

  it('relocates technical copy into a collapsed details surface', () => {
    expect(home).toContain('<details className="shimeLandingTechnical">');
    expect(home).not.toMatch(/<details className="shimeLandingTechnical"[^>]*open/);
    for (const text of ['JSON/CSV', 'Text/Markdown', 'PDF/DOCX/PPTX/ZIP', 'không gọi AI/API', 'Không OCR']) {
      expect(home).toContain(text);
    }
  });

  it('preserves all route destinations without timers or network APIs', () => {
    for (const route of ['/dashboard', '/library', '/study-room']) {
      expect(home).toContain(`navigate('${route}')`);
    }
    expect(home).not.toMatch(/\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/);
    expect(home).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket)\b/);
  });
});

describe('BIG-UPDATE-11 — semantic brand and shell', () => {
  it('defines stable purple, robot mint, surface, ink, warning, and focus roles', () => {
    for (const token of [
      '--shime-action', '--shime-action-strong', '--shime-robot', '--shime-robot-soft',
      '--shime-canvas', '--shime-surface', '--shime-ink', '--shime-warning', '--shime-focus-ring'
    ]) {
      expect(tokens).toContain(token);
    }
  });

  it('uses a reusable robot mark instead of the plain S and consistent route icons', () => {
    expect(sidebar).toContain('ShimeBrandMark');
    expect(sidebar).not.toContain('aria-hidden="true">S</span>');
    expect(sidebar).toContain('ShimeNavigationIcon');
    expect(bottomNav).toContain('ShimeNavigationIcon');
    expect(sidebar).toContain('to={item.path}');
    expect(bottomNav).toContain('to={item.path}');
  });

  it('renders the brand mark decoratively and informatively', () => {
    const decorative = renderToStaticMarkup(<ShimeBrandMark />);
    const informative = renderToStaticMarkup(<ShimeBrandMark decorative={false} label="Shime" />);
    expect(decorative).toContain('aria-hidden="true"');
    expect(informative).toContain('role="img"');
    expect(informative).toContain('aria-label="Shime"');
  });

  it('adds a skip link for both standard and focus layouts', () => {
    expect(appLayout.match(/className="skipLink"/g)).toHaveLength(2);
    expect(appLayout).toContain('href="#main-content"');
    expect(css).toContain('.skipLink:focus-visible');
  });
});

describe('BIG-UPDATE-11 — learner-first Overview tiers', () => {
  it('keeps the requested default metrics visible in the learner summary', () => {
    for (const label of [
      'Câu đến hạn', 'Mục tiêu ngày', 'Tỷ lệ đúng gần đây', 'Chuỗi ngày học',
      'Phiên đã hoàn thành', 'Cần chú ý', 'Theo môn'
    ]) {
      expect(summary).toContain(label);
    }
    expect(summary).toContain("navigate('/study-room')");
  });

  it('moves existing technical panels into explicit advanced and developer disclosures', () => {
    expect(dashboard).toContain('title="Thông tin nâng cao"');
    expect(dashboard).toContain('title="Chẩn đoán dành cho nhà phát triển"');
    expect(dashboard).toContain('level="advanced"');
    expect(dashboard).toContain('level="developer"');
    for (const component of [
      'HistoryAnalyticsPanel', 'MasteryInsightsPanel', 'ReviewSchedulePanel',
      'SmartPracticePanel', 'StudyHistoryPanel', 'MixedSchedulerDueNote'
    ]) {
      expect(dashboard).toContain(`<${component}`);
    }
  });

  it('renders disclosures collapsed with explicit aria-expanded state', () => {
    const html = renderToStaticMarkup(
      <OverviewDisclosure title="Thông tin nâng cao"><span>Nội dung</span></OverviewDisclosure>
    );
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(disclosure).toContain('aria-controls');
    expect(disclosure).toContain('onClick={() => setOpen(current => !current)}');
  });

  it('keeps raw history data available but closed by default', () => {
    expect(history).toContain('item.userAnswer');
    expect(history).toContain('item.correctAnswer');
    expect(history).toContain('item.prompt');
    expect(history).toContain('className="technicalDetails"');
    expect(history).not.toMatch(/className="technicalDetails"[\s\S]{0,400}}\s*open>/);
  });

  it('uses roving tab focus and arrow-key navigation without changing routes', () => {
    expect(dashboard).toContain("const orderedViews = ['today', 'progress']");
    expect(dashboard).toContain("event.key === 'ArrowRight'");
    expect(dashboard).toContain("event.key === 'ArrowLeft'");
    expect(dashboard).toContain('tabIndex={dashboardView');
    expect(dashboard).toContain("navigate('/study-room')");
  });
});

describe('BIG-UPDATE-11 — runtime boundary', () => {
  it('adds no forbidden APIs or heavy dependencies to changed presentation sources', () => {
    const changedUi = [home, dashboard, summary, disclosure, appLayout, sidebar, bottomNav].join('\n');
    for (const forbidden of [
      'fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.bluetooth', 'navigator.serial',
      'getUserMedia', 'MediaRecorder', 'Notification.requestPermission', 'serviceWorker.register'
    ]) {
      expect(changedUi).not.toContain(forbidden);
    }
    expect(changedUi).not.toMatch(/from\s+['"](?:framer-motion|gsap|lottie|three)['"]/);
  });
});
