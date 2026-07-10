import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StudyRoomSubjectSpaces from '../../src/components/study/StudyRoomSubjectSpaces.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const globalCss = fs.readFileSync(path.resolve(__dirname, '../../src/styles/global.css'), 'utf8');
const studyRoomSource = fs.readFileSync(path.resolve(__dirname, '../../src/routes/StudyRoom.jsx'), 'utf8');

describe('StudyRoom gesture tuning surface', () => {
  it('keeps subject navigation buttons available without raw robot content', () => {
    const html = renderToStaticMarkup(
      <StudyRoomSubjectSpaces
        subjectSpaces={[
          { subjectId: 'math', subjectLabel: 'Toán', dueCount: 1, overdueCount: 0, cardCount: 8, newCount: 2, reviewCount: 6, forgettingPressureBucket: 'low', workloadBucket: 'normal', focusRecommendation: 'quick_review' },
          { subjectId: 'physics', subjectLabel: 'Vật lý', dueCount: 4, overdueCount: 1, cardCount: 12, newCount: 1, reviewCount: 11, forgettingPressureBucket: 'medium', workloadBucket: 'normal', focusRecommendation: 'normal_session' }
        ]}
        activeSubjectId="math"
        navigation={{ canGoPrev: false, canGoNext: true, ariaLabel: 'Không gian học Toán' }}
      />
    );
    expect(html).toContain('Môn sau');
    expect(html).toContain('role="tablist"');
    expect(html).not.toMatch(/rawQuizPayload|raw question|raw answer/i);
  });

  it('uses tuned gesture model, vertical pan, proximity snap, and reduced motion guard', () => {
    expect(studyRoomSource).toContain('resolveStudyRoomSwipeGesture');
    expect(studyRoomSource).not.toContain('preventDefault');
    expect(globalCss).toContain('touch-action: pan-y');
    expect(globalCss).toContain('scroll-snap-type: x proximity');
    expect(globalCss).toContain('prefers-reduced-motion: reduce');
    expect(globalCss).toContain('studyQuestionSoftIn 0.18s ease-out both');
  });
});
