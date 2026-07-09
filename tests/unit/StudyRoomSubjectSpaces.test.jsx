import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StudyRoomSubjectSpaces from '../../src/components/study/StudyRoomSubjectSpaces.jsx';

describe('StudyRoomSubjectSpaces', () => {
  it('renders multiple subject spaces and forgetting pressure without raw content', () => {
    const html = renderToStaticMarkup(
      <StudyRoomSubjectSpaces
        subjectSpaces={[
          { subjectId: 'math', subjectLabel: 'Toán', dueCount: 2, overdueCount: 0, cardCount: 10, newCount: 3, reviewCount: 7, forgettingPressureBucket: 'medium', workloadBucket: 'normal', focusRecommendation: 'normal_session' },
          { subjectId: 'physics', subjectLabel: 'Vật lý', dueCount: 8, overdueCount: 4, cardCount: 12, newCount: 1, reviewCount: 11, forgettingPressureBucket: 'urgent', workloadBucket: 'normal', focusRecommendation: 'rescue_review' }
        ]}
        activeSubjectId="physics"
        navigation={{ canGoPrev: true, canGoNext: false, ariaLabel: 'Không gian học Vật lý' }}
        alerts={[{ subjectId: 'physics', userFacingBody: 'Nên ôn nhanh 10 phút để tránh quên' }]}
      />
    );
    expect(html).toContain('Phòng học theo môn');
    expect(html).toContain('Vuốt để chuyển môn');
    expect(html).toContain('Vật lý');
    expect(html).toContain('Sắp quên: urgent');
    expect(html).toContain('Ôn nhanh');
    expect(html).not.toMatch(/raw prompt|raw question|raw answer/i);
  });
});
