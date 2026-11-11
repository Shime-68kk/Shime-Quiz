import { describe, expect, it } from 'vitest';
import {
  MAX_ACTIVE_LEARNING,
  MOCK_TEST_SIZE,
  answerCard,
  buildMockTest,
  getLevel,
  isScopeComplete,
  orderChoices,
  pickNextCard,
  summarize
} from '../../src/cram/cramEngine.js';
import leThuyDeck from '../../src/data/leThuyDeck.js';
import { validateLearningDataImport } from '../../src/data/importValidator.js';
import { isStudentDeployment } from '../../src/config/studentDeployment.js';

const MIN = 60 * 1000;
const T0 = Date.parse('2026-11-11T20:00:00Z');
const items = Array.from({ length: 12 }, (_, i) => ({ id: `q${i + 1}` }));

describe('Lệ Thủy deck', () => {
  it('has 219 valid multiple-choice items across 10 chapters with a correct answer each', () => {
    expect(leThuyDeck.topics).toHaveLength(10);
    expect(leThuyDeck.items).toHaveLength(219);
    expect(new Set(leThuyDeck.items.map(item => item.id)).size).toBe(219);
    for (const item of leThuyDeck.items) {
      expect(item.choices.map(choice => choice.id)).toContain(item.correctAnswer);
    }
    const validation = validateLearningDataImport(leThuyDeck);
    expect(validation.canImport).toBe(true);
    expect(validation.normalizedData.items).toHaveLength(219);
  });
});

describe('student deployment flag', () => {
  it('is off under test mode, on otherwise, and can be overridden', () => {
    expect(isStudentDeployment({ MODE: 'test' })).toBe(false);
    expect(isStudentDeployment({ MODE: 'production' })).toBe(true);
    expect(isStudentDeployment({ MODE: 'production', VITE_SHIME_STUDENT_DEPLOYMENT: 'off' })).toBe(false);
    expect(isStudentDeployment({ MODE: 'test', VITE_SHIME_STUDENT_DEPLOYMENT: 'on' })).toBe(true);
  });
});

describe('FSRS cram engine', () => {
  it('a new card answered right goes to a short learning step, a second right answer learns it', () => {
    let result = answerCard({}, 'q1', true, T0);
    expect(result.outcome.kind).toBe('stepUp');
    expect(result.outcome.waitMinutes).toBe(10);
    result = answerCard(result.states, 'q1', true, T0 + 10 * MIN);
    expect(result.outcome.kind).toBe('learned');
    expect(result.outcome.waitMinutes).toBeGreaterThanOrEqual(24 * 60);
    expect(summarize([{ id: 'q1' }], result.states, T0 + 11 * MIN).knownPercent).toBe(100);
  });

  it('a wrong answer comes back within minutes and counts as a mistake', () => {
    const learned = answerCard(answerCard({}, 'q1', true, T0).states, 'q1', true, T0 + 10 * MIN).states;
    const result = answerCard(learned, 'q1', false, T0 + 2 * 24 * 60 * MIN);
    expect(result.outcome.kind).toBe('again');
    expect(result.outcome.waitMinutes).toBeLessThanOrEqual(10);
    const summary = summarize([{ id: 'q1' }], result.states, T0 + 2 * 24 * 60 * MIN);
    expect(summary.knownPercent).toBe(0);
    expect(summary.mistakes).toBe(1);
  });

  it('introduces only a few new cards at a time, then works the learning ones', () => {
    let states = {};
    let now = T0;
    const shown = [];
    for (let i = 0; i < 20; i += 1) {
      const id = pickNextCard(items, states, now, { recent: shown });
      shown.push(id);
      states = answerCard(states, id, true, now).states;
      now += 20 * 1000;
    }
    const learningOrLearned = Object.keys(states).length;
    expect(learningOrLearned).toBeGreaterThanOrEqual(MAX_ACTIVE_LEARNING);
    expect(learningOrLearned).toBeLessThan(items.length + 1);
    // never repeats the card just answered
    for (let i = 1; i < shown.length; i += 1) expect(shown[i]).not.toBe(shown[i - 1]);
  });

  it('continuous study never runs dry: it keeps reviewing the weakest cards ahead of time', () => {
    let states = {};
    for (const item of items) {
      states = answerCard(states, item.id, true, T0).states;
      states = answerCard(states, item.id, true, T0 + 10 * MIN).states;
    }
    const later = T0 + 30 * MIN;
    expect(isScopeComplete(items, states, later)).toBe(true);
    expect(pickNextCard(items, states, later)).toBeTruthy();
  });

  it('prioritises due reviews over new cards', () => {
    let states = answerCard({}, 'q5', true, T0).states;
    states = answerCard(states, 'q5', true, T0 + 10 * MIN).states;
    const nextDay = T0 + 3 * 24 * 60 * MIN;
    expect(pickNextCard(items, states, nextDay)).toBe('q5');
  });

  it('maps memorised share to five levels', () => {
    expect(getLevel(0).title).toBe('Mới bắt đầu');
    expect(getLevel(0.5).title).toBe('Đang tiến bộ');
    expect(getLevel(0.95).title).toBe('Sẵn sàng đi thi');
  });

  it('builds a mock test drawing from every chapter', () => {
    const chapters = [0, 1, 2].map(n => ({ items: Array.from({ length: 20 }, (_, i) => ({ id: `c${n}-${i}` })) }));
    const test = buildMockTest(chapters, 12, () => 0.3);
    expect(test).toHaveLength(12);
    expect(new Set(test).size).toBe(12);
    for (const n of [0, 1, 2]) expect(test.some(id => id.startsWith(`c${n}-`))).toBe(true);
    expect(MOCK_TEST_SIZE).toBe(25);
  });

  it('keeps option order when an option refers to the others', () => {
    const choices = [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }, { id: 'C', text: 'z' }, { id: 'D', text: 'Cả 3 phương án trên' }];
    expect(orderChoices(choices, () => 0)).toEqual(choices);
    expect(orderChoices(choices.slice(0, 3), () => 0).map(c => c.id)).not.toEqual(['A', 'B', 'C']);
  });
});
