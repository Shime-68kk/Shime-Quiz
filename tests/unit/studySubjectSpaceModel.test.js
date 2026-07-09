import { describe, expect, it } from 'vitest';
import { createStudySubjectSpaces } from '../../src/studyRoom/studySubjectSpaceModel.js';

const NOW = '2026-07-09T00:00:00.000Z';
const subjects = [
  { id: 'math', title: 'Toán' },
  { id: 'physics', title: 'Vật lý' }
];
const topics = [
  { id: 'algebra', subjectId: 'math', title: 'Đại số' },
  { id: 'motion', subjectId: 'physics', title: 'Chuyển động' }
];

function item(id, subjectId, topicId = 'algebra', extra = {}) {
  return { id, subjectId, topicId, prompt: 'hidden prompt', correctAnswer: 'hidden', ...extra };
}

describe('studySubjectSpaceModel', () => {
  it('creates one subject space', () => {
    const spaces = createStudySubjectSpaces({ subjects, topics, items: [item('m1', 'math')], now: NOW });
    expect(spaces).toHaveLength(1);
    expect(spaces[0]).toMatchObject({ subjectId: 'math', subjectLabel: 'Toán', cardCount: 1, newCount: 1 });
  });

  it('creates multiple subject spaces with due counts', () => {
    const spaces = createStudySubjectSpaces({
      subjects,
      topics,
      items: [item('m1', 'math'), item('p1', 'physics', 'motion')],
      scheduleRecords: [{ itemId: 'p1', dueAt: '2026-07-08T00:00:00.000Z', schedulerKind: 'sm2-heuristic' }],
      now: NOW
    });
    expect(spaces.map(space => space.subjectId).sort()).toEqual(['math', 'physics']);
    expect(spaces.find(space => space.subjectId === 'physics')).toMatchObject({ dueCount: 1, reviewCount: 1 });
  });

  it('falls back to general when subject metadata is missing', () => {
    const spaces = createStudySubjectSpaces({ items: [{ id: 'x1' }], now: NOW });
    expect(spaces[0]).toMatchObject({ subjectId: 'general', subjectLabel: 'Tổng quan' });
  });

  it('marks overloaded and urgent subject pressure', () => {
    const items = Array.from({ length: 60 }, (_, index) => item(`m${index}`, 'math'));
    const scheduleRecords = items.slice(0, 12).map(card => ({ itemId: card.id, dueAt: '2026-07-01T00:00:00.000Z' }));
    const [space] = createStudySubjectSpaces({ subjects, topics, items, scheduleRecords, now: NOW });
    expect(space.workloadBucket).toBe('overloaded');
    expect(space.forgettingPressureBucket).toBe('urgent');
    expect(space.focusRecommendation).toBe('rescue_review');
  });

  it('keeps no-due cards quiet', () => {
    const [space] = createStudySubjectSpaces({ subjects, topics, items: [item('m1', 'math')], scheduleRecords: [{ itemId: 'm1', dueAt: '2026-07-20T00:00:00.000Z' }], now: NOW });
    expect(space.forgettingPressureBucket).toBe('none');
    expect(space.focusRecommendation).toBe('skip_today');
  });

  it('summarizes mixed scheduler metadata safely', () => {
    const [space] = createStudySubjectSpaces({
      subjects,
      topics,
      items: [item('m1', 'math'), item('m2', 'math')],
      scheduleRecords: [
        { itemId: 'm1', dueAt: '2026-07-08T00:00:00.000Z', schedulerKind: 'sm2-heuristic' },
        { itemId: 'm2', dueAt: '2026-07-08T00:00:00.000Z', schedulerKind: 'fsrs-planned' }
      ],
      now: NOW
    });
    expect(space.schedulerSummary).toEqual({ 'sm2-heuristic': 1, 'fsrs-planned': 1 });
    expect(JSON.stringify(space)).not.toMatch(/hidden prompt|hidden|correctAnswer/);
  });
});
