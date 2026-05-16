/**
 * tests/unit/edugenDraftQualityReviewSourceLibrary.test.jsx
 *
 * Phase 16H — EduGen Draft Quality Review UX / Source-Aware Library Polish.
 *
 * Covers:
 *   • prepareEdugenDraftLibraryImport produces a mergeable raw-data shape
 *     with a dedicated subject/topic for EduGen drafts.
 *   • Duplicate question/answer pairs (vs existing library, vs same batch)
 *     are detected and not silently overwritten.
 *   • sourceMetadata round-trips through normalizeLearningData additively;
 *     items without sourceMetadata continue to work unchanged.
 *   • Malformed sourceMetadata is dropped safely.
 *   • importValidator schema accepts optional sourceMetadata.
 *   • The Library route renders source-aware chips when items carry
 *     EduGen draft metadata.
 *   • Phase 16H runtime files do not introduce ai-process / fetch /
 *     FormData / XHR / ts-fsrs.next() call sites.
 *   • Settings.jsx wires the panel into a real library import path with
 *     explicit confirmation copy.
 *   • Vietnamese-first claim-safe copy in panel/doc.
 *   • Scheduler/storage critical files preserved.
 *   • package.json / package-lock.json parse cleanly (no dependency edit).
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  prepareEdugenDraftLibraryImport,
  isSafeEdugenSourceMetadata,
  EDUGEN_DRAFT_LIBRARY_SUBJECT_ID,
  EDUGEN_DRAFT_LIBRARY_SUBJECT_TITLE,
  EDUGEN_DRAFT_LIBRARY_TOPIC_ID,
  EDUGEN_DRAFT_LIBRARY_TOPIC_TITLE
} from '../../src/edugen/edugenDraftImport.js';
import { parseEdugenDraftJson } from '../../src/edugen/edugenDraftParser.js';
import { normalizeLearningData } from '../../src/data/learningDataAdapter.js';
import { validateLearningDataImport } from '../../src/data/importValidator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function makeDraftItems(rows) {
  const input = JSON.stringify({ items: rows });
  const parsed = parseEdugenDraftJson(input, { now: () => new Date('2026-05-16T10:00:00.000Z') });
  if (!parsed.ok) {
    throw new Error(`Test fixture parse failed: ${parsed.error}`);
  }
  return { items: parsed.items, summary: parsed.summary };
}

// ── 1. prepareEdugenDraftLibraryImport — happy path ──────────────────────────

describe('prepareEdugenDraftLibraryImport — happy path', () => {
  it('builds a merged raw-data object with a dedicated subject/topic', () => {
    const { items, summary } = makeDraftItems([
      { question: 'Capital of Japan?', answer: 'Tokyo', source: 'world.pdf' },
      { question: '2 + 3 = ?', answer: '5' }
    ]);
    const currentRawData = { subjects: [], topics: [], items: [] };

    const result = prepareEdugenDraftLibraryImport({
      draftItems: items,
      currentRawData,
      summary,
      now: () => new Date('2026-05-16T11:00:00.000Z')
    });

    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(result.subjectId).toBe(EDUGEN_DRAFT_LIBRARY_SUBJECT_ID);
    expect(result.topicId).toBe(EDUGEN_DRAFT_LIBRARY_TOPIC_ID);
    expect(result.summary.addedCount).toBe(2);
    expect(result.summary.duplicateCount).toBe(0);
    expect(result.mergedRawData.subjects).toHaveLength(1);
    expect(result.mergedRawData.subjects[0].title).toBe(EDUGEN_DRAFT_LIBRARY_SUBJECT_TITLE);
    expect(result.mergedRawData.topics).toHaveLength(1);
    expect(result.mergedRawData.topics[0].title).toBe(EDUGEN_DRAFT_LIBRARY_TOPIC_TITLE);
    expect(result.mergedRawData.items).toHaveLength(2);
    for (const item of result.mergedRawData.items) {
      expect(item.type).toBe('flashcard');
      expect(item.sourceMetadata.sourceType).toBe('edugen-draft');
      expect(item.sourceMetadata.processor).toBe('edugen');
      expect(item.sourceMetadata.reviewRequired).toBe(true);
      expect(item.tags).toContain('bản-nháp-cần-xem-lại');
    }
  });
});

// ── 2. Duplicate detection ───────────────────────────────────────────────────

describe('prepareEdugenDraftLibraryImport — duplicate detection', () => {
  it('skips items whose question+answer match an existing library item', () => {
    const { items, summary } = makeDraftItems([
      { question: 'Capital of Japan?', answer: 'Tokyo' },
      { question: 'Capital of France?', answer: 'Paris' }
    ]);

    const currentRawData = {
      subjects: [{ id: 'geo', title: 'Địa lý' }],
      topics: [{ id: 'caps', subjectId: 'geo', title: 'Thủ đô' }],
      items: [
        {
          id: 'existing-1',
          type: 'flashcard',
          subjectId: 'geo',
          topicId: 'caps',
          prompt: 'Capital of Japan?',
          answer: 'Tokyo',
          correctAnswer: 'Tokyo'
        }
      ]
    };

    const result = prepareEdugenDraftLibraryImport({
      draftItems: items,
      currentRawData,
      summary,
      now: () => new Date('2026-05-16T12:00:00.000Z')
    });

    expect(result.ok).toBe(true);
    expect(result.summary.addedCount).toBe(1);
    expect(result.summary.duplicateCount).toBe(1);
    expect(result.duplicateItems[0].existingItemId).toBe('existing-1');
    expect(result.mergedRawData.items).toHaveLength(2);
    // The original item id is preserved — no silent overwrite.
    expect(result.mergedRawData.items.find(item => item.id === 'existing-1')).toBeTruthy();
  });

  it('skips intra-batch duplicates', () => {
    const { items, summary } = makeDraftItems([
      { question: 'Same Q?', answer: 'Same A' },
      { question: 'Same Q?', answer: 'Same A' },
      { question: 'Different Q', answer: 'Different A' }
    ]);

    const result = prepareEdugenDraftLibraryImport({
      draftItems: items,
      currentRawData: {},
      summary
    });

    expect(result.summary.addedCount).toBe(2);
    expect(result.summary.duplicateCount).toBe(1);
  });

  it('returns all_duplicates error when nothing new can be added', () => {
    const { items, summary } = makeDraftItems([
      { question: 'Q1', answer: 'A1' }
    ]);

    const result = prepareEdugenDraftLibraryImport({
      draftItems: items,
      currentRawData: {
        subjects: [{ id: 'edugen-drafts', title: 'Bản nháp EduGen' }],
        topics: [{ id: 'edugen-drafts-review', subjectId: 'edugen-drafts', title: 'Bản nháp cần xem lại' }],
        items: [{
          id: 'existing',
          type: 'flashcard',
          subjectId: 'edugen-drafts',
          topicId: 'edugen-drafts-review',
          prompt: 'Q1',
          answer: 'A1',
          correctAnswer: 'A1'
        }]
      },
      summary
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('all_duplicates');
    expect(result.summary.duplicateCount).toBe(1);
    expect(result.mergedRawData).toBeNull();
  });

  it('returns empty_draft when called with no items', () => {
    const result = prepareEdugenDraftLibraryImport({
      draftItems: [],
      currentRawData: {}
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('empty_draft');
  });
});

// ── 3. sourceMetadata round-trips through normalizeLearningData ──────────────

describe('normalizeLearningData — sourceMetadata round-trip', () => {
  it('preserves valid sourceMetadata on items', () => {
    const { items, summary } = makeDraftItems([
      { question: 'RT?', answer: 'OK', source: 'ch1.pdf' }
    ]);
    const prepared = prepareEdugenDraftLibraryImport({
      draftItems: items,
      currentRawData: {},
      summary
    });

    const normalized = normalizeLearningData(prepared.mergedRawData);
    const item = normalized.items[0];
    expect(item).toBeDefined();
    expect(item.sourceMetadata).toBeDefined();
    expect(item.sourceMetadata.sourceType).toBe('edugen-draft');
    expect(item.sourceMetadata.reviewRequired).toBe(true);
    expect(item.sourceMetadata.processor).toBe('edugen');
  });

  it('does not add sourceMetadata to items that did not have it', () => {
    const normalized = normalizeLearningData({
      subjects: [{ id: 'a', title: 'A' }],
      topics: [{ id: 't', subjectId: 'a', title: 'T' }],
      items: [{
        id: '1',
        type: 'flashcard',
        subjectId: 'a',
        topicId: 't',
        prompt: 'P',
        answer: 'X',
        correctAnswer: 'X'
      }]
    });
    expect(normalized.items[0]).toBeDefined();
    expect(normalized.items[0].sourceMetadata).toBeUndefined();
  });

  it('drops malformed sourceMetadata without breaking the item', () => {
    const normalized = normalizeLearningData({
      subjects: [{ id: 'a', title: 'A' }],
      topics: [{ id: 't', subjectId: 'a', title: 'T' }],
      items: [{
        id: '1',
        type: 'flashcard',
        subjectId: 'a',
        topicId: 't',
        prompt: 'P',
        answer: 'X',
        correctAnswer: 'X',
        sourceMetadata: {
          sourceType: 'unknown-source',
          reviewRequired: false
        }
      }]
    });
    expect(normalized.items[0]).toBeDefined();
    expect(normalized.items[0].sourceMetadata).toBeUndefined();
  });
});

// ── 4. isSafeEdugenSourceMetadata predicate ──────────────────────────────────

describe('isSafeEdugenSourceMetadata', () => {
  it('accepts a well-shaped block', () => {
    expect(isSafeEdugenSourceMetadata({
      sourceType: 'edugen-draft',
      sourceName: 'chap1.pdf',
      importedAt: '2026-05-16T10:00:00.000Z',
      processor: 'edugen',
      reviewRequired: true
    })).toBe(true);
  });

  it('rejects mismatched sourceType', () => {
    expect(isSafeEdugenSourceMetadata({
      sourceType: 'other',
      reviewRequired: true
    })).toBe(false);
  });

  it('rejects reviewRequired !== true', () => {
    expect(isSafeEdugenSourceMetadata({
      sourceType: 'edugen-draft',
      reviewRequired: false
    })).toBe(false);
  });

  it('rejects oversized sourceName', () => {
    expect(isSafeEdugenSourceMetadata({
      sourceType: 'edugen-draft',
      sourceName: 'x'.repeat(241),
      reviewRequired: true
    })).toBe(false);
  });

  it('rejects non-object inputs', () => {
    expect(isSafeEdugenSourceMetadata(null)).toBe(false);
    expect(isSafeEdugenSourceMetadata('edugen-draft')).toBe(false);
    expect(isSafeEdugenSourceMetadata([])).toBe(false);
  });
});

// ── 5. validateLearningDataImport accepts items with sourceMetadata ──────────

describe('validateLearningDataImport — sourceMetadata schema', () => {
  it('allows items with the additive sourceMetadata block', () => {
    const result = validateLearningDataImport({
      subjects: [{ id: 'a', title: 'A' }],
      topics: [{ id: 't', subjectId: 'a', title: 'T' }],
      items: [{
        id: '1',
        type: 'flashcard',
        subjectId: 'a',
        topicId: 't',
        prompt: 'P',
        answer: 'X',
        correctAnswer: 'X',
        sourceMetadata: {
          sourceType: 'edugen-draft',
          sourceName: 'chap1.pdf',
          importedAt: '2026-05-16T10:00:00.000Z',
          processor: 'edugen',
          reviewRequired: true
        }
      }]
    });
    expect(result.canImport).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.normalizedData.items[0].sourceMetadata.sourceType).toBe('edugen-draft');
  });

  it('still accepts items without sourceMetadata', () => {
    const result = validateLearningDataImport({
      subjects: [{ id: 'a', title: 'A' }],
      topics: [{ id: 't', subjectId: 'a', title: 'T' }],
      items: [{
        id: '1',
        type: 'flashcard',
        subjectId: 'a',
        topicId: 't',
        prompt: 'P',
        answer: 'X',
        correctAnswer: 'X'
      }]
    });
    expect(result.canImport).toBe(true);
  });
});

// ── 6. Phase 16H runtime safety (static) ─────────────────────────────────────

describe('Phase 16H — runtime safety (static)', () => {
  const targets = [
    'src/edugen/edugenDraftImport.js',
    'src/components/edugen/EduGenDraftReviewPanel.jsx',
    'src/routes/Settings.jsx'
  ];

  for (const target of targets) {
    it(`${target} does not call ai-process`, () => {
      expect(read(target)).not.toContain('ai-process');
    });

    it(`${target} does not use fetch / XHR / FormData`, () => {
      const source = read(target);
      expect(source).not.toMatch(/\bfetch\s*\(/);
      expect(source).not.toContain('FormData');
      expect(source).not.toContain('XMLHttpRequest');
    });

    it(`${target} does not import ts-fsrs`, () => {
      const source = read(target);
      expect(source).not.toMatch(/ts-fsrs/);
    });
  }

  it('edugenDraftImport.js does not call .next() (no scheduler write)', () => {
    const source = read('src/edugen/edugenDraftImport.js');
    expect(source).not.toMatch(/\.next\(/);
  });
});

// ── 7. Settings.jsx wires the panel into a real library import path ─────────

describe('Phase 16H — Settings.jsx wiring', () => {
  const settings = read('src/routes/Settings.jsx');

  it('imports prepareEdugenDraftLibraryImport', () => {
    expect(settings).toContain('prepareEdugenDraftLibraryImport');
  });

  it('imports setLearningData', () => {
    expect(settings).toContain('setLearningData');
  });

  it('passes onConfirmImport to EduGenDraftReviewPanel', () => {
    expect(settings).toMatch(/<EduGenDraftReviewPanel[\s\S]*onConfirmImport=\{/);
  });

  it('keeps Phase 16F + FSRS panel mounts', () => {
    expect(settings).toContain('EduGenDraftWorkshopPanel');
    expect(settings).toContain('FsrsExperimentalSettingsPanel');
  });
});

// ── 8. Panel — Vietnamese-first claim-safe copy, backup nudge ────────────────

describe('Phase 16H — EduGenDraftReviewPanel copy', () => {
  const panel = read('src/components/edugen/EduGenDraftReviewPanel.jsx');

  it('keeps the Phase 16G claim-safe phrases', () => {
    expect(panel).toContain('Xưởng bản nháp EduGen');
    expect(panel).toContain('Xem lại trước khi lưu');
    expect(panel).toContain('Xác nhận lưu bản nháp');
    expect(panel).toContain('Không có thẻ nào được lưu cho đến khi bạn xác nhận');
    expect(panel).toContain('Kết quả có thể sai hoặc thiếu ý');
  });

  it('shows the Phase 16H backup-before-import nudge', () => {
    expect(panel).toContain('Tạo bản sao lưu trước khi nhập nhiều thẻ');
  });

  it('mentions the duplicate-skip safeguard so users are not surprised', () => {
    expect(panel).toContain('Thẻ trùng câu hỏi/đáp án sẽ bị bỏ qua');
  });

  it('does not assert forbidden positive claims', () => {
    const forbidden = [
      'shime has built-in ai',
      'shime has built-in ocr',
      'cloud sync is available',
      'edugen is bundled with shime',
      'api key required',
      'byok is supported'
    ];
    for (const phrase of forbidden) {
      expect(panel.toLowerCase()).not.toContain(phrase);
    }
  });
});

// ── 9. Library polish renders source-aware chips ─────────────────────────────

describe('Phase 16H — Library route source-aware polish', () => {
  const library = read('src/routes/Library.jsx');

  it('imports isSafeEdugenSourceMetadata', () => {
    expect(library).toContain('isSafeEdugenSourceMetadata');
  });

  it('renders a Bản nháp cần xem lại badge', () => {
    expect(library).toContain('Bản nháp cần xem lại');
  });

  it('renders a Nguồn: EduGen badge', () => {
    expect(library).toContain('Nguồn: EduGen');
  });
});

// ── 10. Scheduler / storage critical files preserved ─────────────────────────

describe('Phase 16H — scheduler/storage critical files preserved', () => {
  it('fsrsWrapper.js still has exactly 2 .next() call sites', () => {
    const wrapper = read('src/quiz/fsrsWrapper.js');
    const matches = wrapper.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('reviewSchedulerAdapter.js preserves fsrsActiveSchedulingEnabled', () => {
    const adapter = read('src/quiz/reviewSchedulerAdapter.js');
    expect(adapter).toContain('fsrsActiveSchedulingEnabled');
    expect(adapter).toContain('fsrsExperimentalEnabled');
  });

  it('reviewScheduleStorage.js still exports REVIEW_SCHEDULE_STORAGE_KEY', () => {
    const storage = read('src/state/reviewScheduleStorage.js');
    expect(storage).toContain('REVIEW_SCHEDULE_STORAGE_KEY');
  });
});

// ── 11. package files unchanged ──────────────────────────────────────────────

describe('Phase 16H — package files parse cleanly', () => {
  it('package.json parses as valid JSON', () => {
    expect(() => JSON.parse(read('package.json'))).not.toThrow();
  });

  it('package-lock.json parses as valid JSON', () => {
    expect(() => JSON.parse(read('package-lock.json'))).not.toThrow();
  });
});

// ── 12. Workflow registration ────────────────────────────────────────────────

describe('Phase 16H — workflow registration', () => {
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('registers the Phase 16H validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js');
  });

  it('keeps Phase 16G before Phase 16H', () => {
    const gIdx = workflow.indexOf('node scripts/validate-phase16g-edugen-draft-review-import-flow.js');
    const hIdx = workflow.indexOf('node scripts/validate-phase16h-edugen-draft-quality-review-source-aware-library.js');
    expect(gIdx).toBeGreaterThan(-1);
    expect(hIdx).toBeGreaterThan(gIdx);
  });
});

// ── 13. Doc required terms ───────────────────────────────────────────────────

describe('Phase 16H — required doc exists with required terms', () => {
  const doc = read('docs/phase16h-edugen-draft-quality-review-source-aware-library.md');
  const docLower = doc.toLowerCase();

  const requiredTerms = [
    'bản nháp cần xem lại',
    'nguồn: edugen',
    'xác nhận lưu vào thư viện',
    'tạo bản sao lưu trước khi nhập nhiều thẻ',
    'sourcemetadata',
    'reviewrequired',
    'no automatic import-to-study',
    'no automatic fsrs activation',
    'no built-in ai',
    'no ocr',
    'no cloud sync',
    'local-first',
    'optional companion',
    'not bundled',
    'duplicate'
  ];

  for (const term of requiredTerms) {
    it(`contains required term: ${term}`, () => {
      expect(docLower).toContain(term);
    });
  }
});

// ── 14. Forbidden positive claims absent across new surfaces ─────────────────

describe('Phase 16H — forbidden positive-claim assertions absent', () => {
  const targets = [
    'docs/phase16h-edugen-draft-quality-review-source-aware-library.md',
    'src/edugen/edugenDraftImport.js',
    'src/components/edugen/EduGenDraftReviewPanel.jsx',
    'src/routes/Settings.jsx'
  ];

  const forbidden = [
    'edugen is bundled with shime',
    'shime includes edugen',
    'shime has built-in ai',
    'shime has built-in ocr',
    'built-in ai quiz generation exists',
    'built-in ocr exists',
    'ocr is supported',
    'cloud sync is available',
    'cloud sync exists',
    'sync has shipped',
    'ai scheduling is enabled',
    'mastery is guaranteed',
    'generated questions are guaranteed correct',
    'frontend-only processes documents',
    'api key required',
    'byok is supported'
  ];

  for (const target of targets) {
    for (const phrase of forbidden) {
      it(`${target} does not assert "${phrase}"`, () => {
        expect(read(target).toLowerCase()).not.toContain(phrase);
      });
    }
  }
});
