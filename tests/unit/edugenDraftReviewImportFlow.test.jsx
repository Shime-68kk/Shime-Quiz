/**
 * tests/unit/edugenDraftReviewImportFlow.test.jsx
 *
 * Phase 16G — EduGen Draft Review Import Flow unit tests.
 *
 * Pure parser + static source inspection. No jsdom rendering — render
 * checks happen on the JSX source as in earlier UI phases.
 *
 * Covers:
 *   • valid JSON draft parses/normalizes (object + array shapes)
 *   • empty / invalid / shape / size / field-length error paths
 *   • source metadata is review-required and safe
 *   • no ai-process / FormData / fetch / ts-fsrs in the new runtime files
 *   • Vietnamese-first claim-safe copy in panel/parser
 *   • required UI affordances (explicit save, preview, large import guard)
 *   • Settings.jsx mounts the new panel without breaking Phase 16F mount
 *   • package files unchanged (parse cleanly only — no dependency edit)
 *   • scheduler/storage critical files preserved
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EDUGEN_DRAFT_ERROR_CODES,
  EDUGEN_DRAFT_PROCESSOR,
  EDUGEN_DRAFT_SOURCE_TYPE,
  MAX_DRAFT_ITEMS,
  MAX_FIELD_LENGTH,
  describeEdugenDraftError,
  describeEdugenDraftInvalidReason,
  parseEdugenDraftJson
} from '../../src/edugen/edugenDraftParser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

// ── 1. parseEdugenDraftJson — happy paths ────────────────────────────────────

describe('parseEdugenDraftJson — object shape', () => {
  it('parses an items[] envelope and normalizes whitespace', () => {
    const input = JSON.stringify({
      items: [
        { question: '  What is 2+2?  ', answer: ' 4 ', source: 'math.pdf' },
        { question: 'Capital of France?', answer: 'Paris' }
      ]
    });
    const result = parseEdugenDraftJson(input);
    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(2);
    expect(result.items[0].question).toBe('What is 2+2?');
    expect(result.items[0].answer).toBe('4');
    expect(result.items[0].sourceMetadata.sourceName).toBe('math.pdf');
    expect(result.items[1].sourceMetadata.sourceName).toBe('');
    expect(result.summary.totalSubmitted).toBe(2);
    expect(result.summary.validCount).toBe(2);
    expect(result.summary.invalidCount).toBe(0);
  });
});

describe('parseEdugenDraftJson — array shape', () => {
  it('parses a bare array of items', () => {
    const input = JSON.stringify([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' }
    ]);
    const result = parseEdugenDraftJson(input);
    expect(result.ok).toBe(true);
    expect(result.items.map(i => i.question)).toEqual(['Q1', 'Q2']);
  });
});

// ── 2. parseEdugenDraftJson — error paths ────────────────────────────────────

describe('parseEdugenDraftJson — empty input', () => {
  it('returns empty_input error when text is blank', () => {
    const result = parseEdugenDraftJson('   \n  ');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.EMPTY);
    expect(result.items).toHaveLength(0);
  });

  it('returns empty_input error for non-string input', () => {
    const result = parseEdugenDraftJson(null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.EMPTY);
  });
});

describe('parseEdugenDraftJson — invalid JSON', () => {
  it('returns invalid_json error for malformed JSON', () => {
    const result = parseEdugenDraftJson('{ this is not json');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.INVALID_JSON);
  });
});

describe('parseEdugenDraftJson — unsupported shape', () => {
  it('rejects a bare object without items[]', () => {
    const result = parseEdugenDraftJson(JSON.stringify({ foo: 'bar' }));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.UNSUPPORTED_SHAPE);
  });

  it('rejects a JSON string primitive', () => {
    const result = parseEdugenDraftJson('"just a string"');
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.UNSUPPORTED_SHAPE);
  });
});

describe('parseEdugenDraftJson — empty fields rejected', () => {
  it('rejects empty question', () => {
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: '   ', answer: 'A' }]
    }));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.NO_VALID_ITEMS);
    expect(result.invalid).toEqual([{ index: 0, reason: 'empty_question' }]);
  });

  it('rejects empty answer', () => {
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: 'Q', answer: '' }]
    }));
    expect(result.ok).toBe(false);
    expect(result.invalid).toEqual([{ index: 0, reason: 'empty_answer' }]);
  });

  it('mixes valid and invalid entries', () => {
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [
        { question: 'Good Q', answer: 'Good A' },
        { question: '', answer: 'lonely answer' },
        { question: 'Another Q', answer: 'Another A' }
      ]
    }));
    expect(result.ok).toBe(true);
    expect(result.items).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
    expect(result.summary.totalSubmitted).toBe(3);
  });
});

describe('parseEdugenDraftJson — oversized count', () => {
  it('rejects more than MAX_DRAFT_ITEMS items', () => {
    const items = [];
    for (let i = 0; i < MAX_DRAFT_ITEMS + 1; i += 1) {
      items.push({ question: `Q${i}`, answer: `A${i}` });
    }
    const result = parseEdugenDraftJson(JSON.stringify({ items }));
    expect(result.ok).toBe(false);
    expect(result.error).toBe(EDUGEN_DRAFT_ERROR_CODES.TOO_MANY_ITEMS);
    expect(result.summary.truncated).toBe(true);
  });

  it('accepts exactly MAX_DRAFT_ITEMS items', () => {
    const items = [];
    for (let i = 0; i < MAX_DRAFT_ITEMS; i += 1) {
      items.push({ question: `Q${i}`, answer: `A${i}` });
    }
    const result = parseEdugenDraftJson(JSON.stringify({ items }));
    expect(result.ok).toBe(true);
    expect(result.items).toHaveLength(MAX_DRAFT_ITEMS);
  });
});

describe('parseEdugenDraftJson — oversized field length', () => {
  it('rejects question longer than MAX_FIELD_LENGTH', () => {
    const overlong = 'x'.repeat(MAX_FIELD_LENGTH + 1);
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: overlong, answer: 'A' }]
    }));
    expect(result.ok).toBe(false);
    expect(result.invalid[0].reason).toBe('question_too_long');
  });

  it('rejects answer longer than MAX_FIELD_LENGTH', () => {
    const overlong = 'y'.repeat(MAX_FIELD_LENGTH + 1);
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: 'Q', answer: overlong }]
    }));
    expect(result.ok).toBe(false);
    expect(result.invalid[0].reason).toBe('answer_too_long');
  });
});

// ── 3. Source metadata is safe + review-required ─────────────────────────────

describe('parseEdugenDraftJson — source metadata', () => {
  it('marks every item as reviewRequired with edugen-draft processor', () => {
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: 'Q', answer: 'A', source: 'chap1.pdf' }]
    }), { now: () => new Date('2026-05-16T10:00:00.000Z') });
    expect(result.ok).toBe(true);
    const meta = result.items[0].sourceMetadata;
    expect(meta.sourceType).toBe(EDUGEN_DRAFT_SOURCE_TYPE);
    expect(meta.processor).toBe(EDUGEN_DRAFT_PROCESSOR);
    expect(meta.reviewRequired).toBe(true);
    expect(meta.sourceName).toBe('chap1.pdf');
    expect(meta.importedAt).toBe('2026-05-16T10:00:00.000Z');
  });

  it('falls back to options.sourceName when item omits source', () => {
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: 'Q', answer: 'A' }]
    }), { sourceName: 'bundle-A.zip' });
    expect(result.items[0].sourceMetadata.sourceName).toBe('bundle-A.zip');
  });

  it('drops source names with control characters', () => {
    const evilName = 'chaphidden';
    const result = parseEdugenDraftJson(JSON.stringify({
      items: [{ question: 'Q', answer: 'A', source: evilName }]
    }));
    expect(result.items[0].sourceMetadata.sourceName).toBe('');
  });
});

// ── 4. Error / invalid reason copy is Vietnamese-first ───────────────────────

describe('describeEdugenDraftError', () => {
  it('returns Vietnamese-first message for each error code', () => {
    const seen = new Set();
    for (const code of Object.values(EDUGEN_DRAFT_ERROR_CODES)) {
      const message = describeEdugenDraftError(code);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(seen.has(message)).toBe(false);
      seen.add(message);
    }
  });

  it('includes "bản nháp" framing for at least one error', () => {
    const messages = Object.values(EDUGEN_DRAFT_ERROR_CODES).map(describeEdugenDraftError);
    expect(messages.some(m => m.includes('bản nháp'))).toBe(true);
  });
});

describe('describeEdugenDraftInvalidReason', () => {
  it('returns Vietnamese-first reason for known invalid reasons', () => {
    expect(describeEdugenDraftInvalidReason('empty_question')).toContain('câu hỏi');
    expect(describeEdugenDraftInvalidReason('empty_answer')).toContain('đáp án');
    expect(describeEdugenDraftInvalidReason('question_too_long')).toContain('Câu hỏi');
    expect(describeEdugenDraftInvalidReason('answer_too_long')).toContain('Đáp án');
  });
});

// ── 5. Parser source safety (static) ─────────────────────────────────────────

describe('Phase 16G — parser source safety', () => {
  const source = read('src/edugen/edugenDraftParser.js');

  it('does not call ai-process', () => {
    expect(source).not.toContain('ai-process');
  });

  it('does not call fetch / XHR / FormData', () => {
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('FormData');
    expect(source).not.toContain('XMLHttpRequest');
  });

  it('does not import or call ts-fsrs', () => {
    expect(source).not.toMatch(/ts-fsrs/);
    expect(source).not.toMatch(/\.next\(/);
  });

  it('does not reference cloud/auth/sync paths', () => {
    expect(source.toLowerCase()).not.toContain('cloud sync');
    expect(source.toLowerCase()).not.toContain('byok');
  });
});

// ── 6. Review panel source — Vietnamese-first, claim-safe, explicit save ─────

describe('Phase 16G — EduGenDraftReviewPanel source', () => {
  const panel = read('src/components/edugen/EduGenDraftReviewPanel.jsx');

  it('uses Xưởng bản nháp framing', () => {
    expect(panel).toContain('Xưởng bản nháp EduGen');
  });

  it('mentions review-before-save copy', () => {
    expect(panel).toContain('Bản nháp cần xem lại trước khi lưu');
    expect(panel).toContain('Shime không tự gọi AI/OCR');
    expect(panel).toContain('EduGen chạy riêng và tùy chọn');
    expect(panel).toContain('Không có thẻ nào được lưu cho đến khi bạn xác nhận');
    expect(panel).toContain('Kết quả có thể sai hoặc thiếu ý');
  });

  it('requires an explicit confirm action', () => {
    expect(panel).toContain('Xác nhận lưu bản nháp');
    expect(panel).toContain('Xem lại trước khi lưu');
  });

  it('does not include a document upload UI', () => {
    expect(panel).not.toContain('input type="file"');
    expect(panel).not.toContain("type='file'");
    expect(panel).not.toContain('FormData');
  });

  it('does not call ai-process or AI/OCR endpoints', () => {
    expect(panel).not.toContain('ai-process');
    expect(panel).not.toMatch(/\/api\/(?:generate|chat|complete|ocr)/);
  });

  it('does not introduce ts-fsrs.next() call sites', () => {
    expect(panel).not.toMatch(/ts-fsrs/);
    expect(panel).not.toMatch(/\.next\(/);
  });

  it('does not assert positive built-in AI / OCR / cloud capabilities', () => {
    const forbidden = [
      'shime has built-in ai',
      'built-in ai quiz generation exists',
      'shime has built-in ocr',
      'cloud sync is available',
      'edugen is bundled with shime',
      'frontend-only processes documents',
      'api key required',
      'byok is supported'
    ];
    for (const phrase of forbidden) {
      expect(panel.toLowerCase()).not.toContain(phrase);
    }
  });
});

// ── 7. Settings.jsx mounts the new panel without losing Phase 16F mounts ─────

describe('Phase 16G — Settings.jsx mounts EduGenDraftReviewPanel', () => {
  const settings = read('src/routes/Settings.jsx');

  it('imports EduGenDraftReviewPanel from src/components/edugen/', () => {
    expect(settings).toContain('EduGenDraftReviewPanel');
    expect(settings).toContain('components/edugen/EduGenDraftReviewPanel.jsx');
  });

  it('renders the new panel JSX', () => {
    expect(settings).toMatch(/<EduGenDraftReviewPanel\b/);
  });

  it('keeps the Phase 16F mounts (EduGenDraftWorkshopPanel + FSRS panel)', () => {
    expect(settings).toContain('EduGenDraftWorkshopPanel');
    expect(settings).toContain('FsrsExperimentalSettingsPanel');
  });
});

// ── 8. Scheduler / storage critical files preserved ──────────────────────────

describe('Phase 16G — scheduler/storage critical files preserved', () => {
  const critical = [
    'src/quiz/reviewSchedulerAdapter.js',
    'src/quiz/fsrsWrapper.js',
    'src/state/reviewScheduleStorage.js'
  ];
  for (const file of critical) {
    it(`${file} exists`, () => {
      expect(fs.existsSync(resolve(PROJECT_ROOT, file))).toBe(true);
    });
  }

  it('fsrsWrapper.js still has exactly 2 .next() call sites (no new ones added)', () => {
    const wrapper = read('src/quiz/fsrsWrapper.js');
    const matches = wrapper.match(/\.next\s*\(/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

// ── 9. Package files unchanged ───────────────────────────────────────────────

describe('Phase 16G — package files parse cleanly', () => {
  it('package.json parses as valid JSON', () => {
    expect(() => JSON.parse(read('package.json'))).not.toThrow();
  });

  it('package-lock.json parses as valid JSON', () => {
    expect(() => JSON.parse(read('package-lock.json'))).not.toThrow();
  });
});

// ── 10. Workflow registration check ──────────────────────────────────────────

describe('Phase 16G — workflow registration', () => {
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('registers the Phase 16G validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16g-edugen-draft-review-import-flow.js');
  });

  it('keeps the Phase 16F validator before Phase 16G', () => {
    const fIdx = workflow.indexOf('node scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js');
    const gIdx = workflow.indexOf('node scripts/validate-phase16g-edugen-draft-review-import-flow.js');
    expect(fIdx).toBeGreaterThan(-1);
    expect(gIdx).toBeGreaterThan(fIdx);
  });
});

// ── 11. Doc required terms ───────────────────────────────────────────────────

describe('Phase 16G — required doc exists with required terms', () => {
  const doc = read('docs/phase16g-edugen-draft-review-import-flow.md');
  const docLower = doc.toLowerCase();

  const requiredTerms = [
    'draft workshop',
    'xưởng bản nháp',
    'bản nháp cần xem lại',
    'xem lại trước khi lưu',
    'review required',
    'preview before save',
    'no automatic import-to-study',
    'no automatic fsrs activation',
    'no built-in ai',
    'no ocr',
    'no cloud sync',
    'local-first',
    'optional companion',
    'not bundled',
    'large import',
    'source attribution'
  ];

  for (const term of requiredTerms) {
    it(`contains required term: ${term}`, () => {
      expect(docLower).toContain(term);
    });
  }
});

// ── 12. Forbidden positive claims absent across new surfaces ─────────────────

describe('Phase 16G — forbidden positive-claim assertions absent', () => {
  const doc = read('docs/phase16g-edugen-draft-review-import-flow.md');
  const panel = read('src/components/edugen/EduGenDraftReviewPanel.jsx');
  const parser = read('src/edugen/edugenDraftParser.js');

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

  for (const phrase of forbidden) {
    it(`doc does not assert "${phrase}"`, () => {
      expect(doc.toLowerCase()).not.toContain(phrase);
    });
    it(`panel does not assert "${phrase}"`, () => {
      expect(panel.toLowerCase()).not.toContain(phrase);
    });
    it(`parser does not assert "${phrase}"`, () => {
      expect(parser.toLowerCase()).not.toContain(phrase);
    });
  }
});
