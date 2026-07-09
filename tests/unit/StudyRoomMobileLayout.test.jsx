import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StudyRoomSubjectSpaces from '../../src/components/study/StudyRoomSubjectSpaces.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const globalCss = fs.readFileSync(path.resolve(__dirname, '../../src/styles/global.css'), 'utf8');

describe('StudyRoom mobile layout polish', () => {
  it('renders mobile subject navigation and preserves pressure summary', () => {
    const html = renderToStaticMarkup(
      <StudyRoomSubjectSpaces
        subjectSpaces={[
          {
            subjectId: 'math',
            subjectLabel: 'Toán nâng cao với nhãn rất dài để kiểm tra xuống dòng',
            dueCount: 3,
            overdueCount: 1,
            cardCount: 18,
            newCount: 4,
            reviewCount: 14,
            forgettingPressureBucket: 'high',
            workloadBucket: 'normal',
            focusRecommendation: 'deep_focus'
          },
          {
            subjectId: 'physics',
            subjectLabel: 'Vật lý',
            dueCount: 0,
            overdueCount: 0,
            cardCount: 8,
            newCount: 2,
            reviewCount: 6,
            forgettingPressureBucket: 'none',
            workloadBucket: 'normal',
            focusRecommendation: 'skip_today'
          }
        ]}
        activeSubjectId="math"
        navigation={{ canGoPrev: false, canGoNext: true, ariaLabel: 'Không gian học Toán' }}
        alerts={[{ subjectId: 'math', userFacingBody: 'Nên ôn nhanh 10 phút để tránh quên' }]}
      />
    );

    expect(html).toContain('data-mobile-studyroom-polish="true"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('Sắp quên: high');
    expect(html).toContain('Buổi học tập trung');
    expect(html).not.toMatch(/raw question|raw answer|rawQuizPayload/i);
  });

  it('defines mobile width, compact prompt, compact options, snap navigation, and reduced motion safety', () => {
    expect(globalCss).toContain('@media (max-width: 640px)');
    expect(globalCss).toContain('width: min(100%, 100vw)');
    expect(globalCss).toContain('font-size: clamp(1.05rem, 4.8vw, 1.42rem)');
    expect(globalCss).toContain('min-height: 50px');
    expect(globalCss).toMatch(/scroll-snap-type:\s*x proximity/u);
    expect(globalCss).not.toMatch(/scroll-snap-type:\s*x mandatory/u);
    expect(globalCss).toContain('touch-action: pan-y');
    expect(globalCss).toContain('studyQuestionSoftIn 0.18s ease-out both');
    expect(globalCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
