/**
 * tests/unit/visualPolishQuickWins.test.jsx
 *
 * Phase 16E — Visual Polish Quick Wins unit tests.
 *
 * Practical static + source checks. No brittle render assertions.
 * Uses static source inspection pattern consistent with prior phases.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const viCopy = read('src/uiI18n/translations/vi.js');
const enCopy = read('src/uiI18n/translations/en.js');

// ── 1. Required Phase 16E files exist ────────────────────────────────────────

describe('Phase 16E — required files exist', () => {
  it('doc exists', () => {
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'docs/phase16e-visual-polish-quick-wins.md'))).toBe(true);
  });

  it('test file exists', () => {
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'tests/unit/visualPolishQuickWins.test.jsx'))).toBe(true);
  });

  it('validator script exists', () => {
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'scripts/validate-phase16e-visual-polish-quick-wins.js'))).toBe(true);
  });
});

// ── 2. Phase 16D identity phrases remain in docs ──────────────────────────────

describe('Phase 16E — Phase 16D identity phrases remain represented', () => {
  const doc = read('docs/phase16e-visual-polish-quick-wins.md');

  it('doc references calm by default', () => {
    expect(doc.toLowerCase()).toContain('calm by default');
  });

  it('doc references beautiful but quiet', () => {
    expect(doc.toLowerCase()).toContain('beautiful but quiet');
  });

  it('doc references motion is breath, not bounce', () => {
    expect(doc.toLowerCase()).toContain('motion is breath, not bounce');
  });

  it('doc references mistakes are signals', () => {
    expect(doc.toLowerCase()).toContain('mistakes are signals');
  });

  it('doc references vietnamese-first', () => {
    expect(doc.toLowerCase()).toContain('vietnamese-first');
  });

  it('doc states no scheduling changes', () => {
    expect(doc.toLowerCase()).toContain('no scheduling changes');
  });

  it('doc states no storage changes', () => {
    expect(doc.toLowerCase()).toContain('no storage changes');
  });

  it('doc states no dependencies', () => {
    expect(doc.toLowerCase()).toContain('no dependencies');
  });

  it('doc states no EduGen runtime', () => {
    expect(doc.toLowerCase()).toContain('no edugen runtime');
  });
});

// ── 3. Vietnamese labels remain in Home ───────────────────────────────────────

describe('Phase 16E — Home.jsx keeps Vietnamese-first labels', () => {
  const home = read('src/routes/Home.jsx');

  it('contains Tổng quan', () => {
    expect(home).toContain("t('home.openOverview')");
    expect(viCopy).toContain("'nav.overview': 'Tổng quan'");
  });

  it('contains Phòng học', () => {
    expect(home).toContain('Phòng học');
  });

  it('contains Thư viện', () => {
    expect(home).toContain("t('nav.library')");
    expect(viCopy).toContain("'nav.library': 'Thư viện'");
  });

  it('contains Mở Thư viện CTA', () => {
    expect(home).toContain("t('home.openLibrary')");
    expect(viCopy).toContain("'home.openLibrary': 'Mở Thư viện'");
  });

  it('contains Phase 16E identity tagline class', () => {
    expect(home).toContain('publicLandingIdentityLine');
  });
});

// ── 4. Dashboard keeps Vietnamese labels and "Lộ trình hôm nay" ──────────────

describe('Phase 16E — Dashboard.jsx keeps Vietnamese-first labels', () => {
  const dashboard = read('src/routes/Dashboard.jsx');

  it('contains Lộ trình hôm nay', () => {
    expect(dashboard).toContain("subtitle={t('overview.subtitle')}");
    expect(viCopy).toContain('Lộ trình hôm nay');
  });

  it('contains Tổng quan', () => {
    expect(dashboard).toContain('Tổng quan');
  });

  it('keeps Vietnamese mixed-scheduler note', () => {
    expect(dashboard).toContain("t('overview.mixedScheduler'");
    expect(viCopy).toContain('thẻ dùng lịch học bộ nhớ thử nghiệm');
  });

  it('does not revert to English-only mixed-scheduler note', () => {
    expect(dashboard).not.toContain('Some cards may use experimental memory scheduling.');
  });
});

// ── 5. Study Room keeps Vietnamese labels ────────────────────────────────────

describe('Phase 16E — StudyRoom.jsx keeps Vietnamese-first labels', () => {
  const room = read('src/routes/StudyRoom.jsx');

  it('contains Câu trước', () => {
    expect(room).toContain("t('study.previous')");
    expect(viCopy).toContain("'study.previous': 'Câu trước'");
  });

  it('contains Câu tiếp theo', () => {
    expect(room).toContain("t('study.next')");
    expect(viCopy).toContain("'study.next': 'Câu tiếp theo'");
  });

  it('contains Lựa chọn từ Thư viện', () => {
    expect(room).toContain("t('study.librarySelection')");
    expect(viCopy).toContain("'study.librarySelection': 'Lựa chọn từ Thư viện'");
  });
});

// ── 6. Memory rating bridge labels remain safe ────────────────────────────────

describe('Phase 16E — FsrsProductionMemoryRatingBridge keeps memory rating labels', () => {
  const bridge = read('src/components/study/FsrsProductionMemoryRatingBridge.jsx');

  it('contains Mức độ nhớ', () => {
    expect(bridge).toContain("t('study.memoryRating')");
    expect(viCopy).toContain("'study.memoryRating': 'Mức độ nhớ'");
  });

  it('contains Nhớ khó', () => {
    expect(bridge).toContain("t('study.memoryHard')");
    expect(viCopy).toContain("'study.memoryHard': 'Nhớ khó'");
  });

  it('contains Nhớ được', () => {
    expect(bridge).toContain("t('study.memoryGood')");
    expect(viCopy).toContain("'study.memoryGood': 'Nhớ được'");
  });

  it('contains Nhớ dễ', () => {
    expect(bridge).toContain("t('study.memoryEasy')");
    expect(viCopy).toContain("'study.memoryEasy': 'Nhớ dễ'");
  });

  it('contains Chưa nhớ', () => {
    expect(bridge).toContain("t('study.memoryAutoAgainActive')");
    expect(viCopy).toContain('Chưa nhớ');
  });

  it('contains Tiếp tục không đánh giá', () => {
    expect(bridge).toContain("t('study.memorySkip')");
    expect(viCopy).toContain("'study.memorySkip': 'Tiếp tục không đánh giá'");
  });

  it('contains Continue without rating for claim-safety assertions', () => {
    expect(enCopy).toContain("'study.memorySkip': 'Continue without rating'");
  });
});

// ── 7. No forbidden internal terms in user-facing UI ─────────────────────────

const uiFiles = [
  'src/routes/Home.jsx',
  'src/routes/Dashboard.jsx',
  'src/routes/StudyRoom.jsx',
  'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
  'src/components/settings/FsrsExperimentalSettingsPanel.jsx',
];

describe('Phase 16E — no forbidden internal terms as JSX text', () => {
  for (const file of uiFiles) {
    it(`${file} does not expose fsrsActiveSchedulingEnabled as JSX text`, () => {
      const source = read(file);
      expect(source).not.toMatch(/>\s*fsrsActiveSchedulingEnabled\s*</);
    });

    it(`${file} does not expose schedulerKind as JSX text`, () => {
      const source = read(file);
      expect(source).not.toMatch(/>\s*schedulerKind\s*</);
    });

    it(`${file} does not expose fsrsPayload as JSX text`, () => {
      const source = read(file);
      expect(source).not.toMatch(/>\s*fsrsPayload\s*</);
    });

    it(`${file} does not expose ts-fsrs as JSX text`, () => {
      const source = read(file);
      expect(source).not.toMatch(/>\s*ts-fsrs\s*</);
    });
  }
});

// ── 8. No forbidden runtime terms in changed runtime files ───────────────────

describe('Phase 16E — no indexedDB/StorageAdapter/SyncAdapter in changed UI', () => {
  for (const file of uiFiles) {
    it(`${file} does not introduce indexedDB`, () => {
      const source = read(file);
      expect(source).not.toContain('indexedDB');
    });

    it(`${file} does not introduce StorageAdapter`, () => {
      const source = read(file);
      expect(source).not.toContain('StorageAdapter');
    });

    it(`${file} does not introduce SyncAdapter`, () => {
      const source = read(file);
      expect(source).not.toContain('SyncAdapter');
    });
  }
});

// ── 9. Package files not changed ─────────────────────────────────────────────

describe('Phase 16E — no package/dependency changes', () => {
  it('package.json parses as valid JSON', () => {
    const text = read('package.json');
    expect(() => JSON.parse(text)).not.toThrow();
  });

  it('package-lock.json parses as valid JSON', () => {
    const text = read('package-lock.json');
    expect(() => JSON.parse(text)).not.toThrow();
  });
});

// ── 10. Scheduler/storage/backup files not changed ───────────────────────────

describe('Phase 16E — scheduler/storage/backup/import files preserved', () => {
  const criticalFiles = [
    'src/quiz/reviewSchedulerAdapter.js',
    'src/quiz/fsrsWrapper.js',
    'src/state/reviewScheduleStorage.js',
    'src/state/settingsStorage.js',
    'src/quiz/dataBackup.js',
    'src/state/v2BackupRestore.js',
  ];

  for (const file of criticalFiles) {
    it(`${file} exists`, () => {
      expect(fs.existsSync(resolve(PROJECT_ROOT, file))).toBe(true);
    });
  }

  it('reviewScheduleStorage preserves storage key', () => {
    const source = read('src/state/reviewScheduleStorage.js');
    expect(source).toContain("'shimeV2ReviewScheduleV1'");
  });

  it('settingsStorage preserves settings key', () => {
    const source = read('src/state/settingsStorage.js');
    expect(source).toContain("'shimeV2SettingsV1'");
  });
});

// ── 11. Reduced motion supported in CSS ──────────────────────────────────────

describe('Phase 16E — reduced motion supported in CSS', () => {
  it('global.css has prefers-reduced-motion block if transitions exist', () => {
    const css = read('src/styles/global.css');
    if (css.includes('transition:') || css.includes('animation:')) {
      expect(css).toContain('prefers-reduced-motion');
    }
  });

  it('global.css does not add forbidden runtime terms', () => {
    const css = read('src/styles/global.css');
    expect(css).not.toContain('indexedDB');
    expect(css).not.toContain('StorageAdapter');
    expect(css).not.toContain('SyncAdapter');
  });
});

// ── 12. Settings panel keeps required English safety copy ─────────────────────

describe('Phase 16E — FsrsExperimentalSettingsPanel keeps required safety copy', () => {
  const panel = read('src/components/settings/FsrsExperimentalSettingsPanel.jsx');

  it('contains Enable FSRS Memory Model (Experimental)', () => {
    expect(panel).toContain("t('settings.fsrsTitle')");
    expect(enCopy).toContain("'settings.fsrsTitle': 'Experimental memory scheduling'");
  });

  it('contains Preparation Phase Only', () => {
    expect(panel).toContain("t('settings.fsrsPreparation')");
    expect(enCopy).toContain("'settings.fsrsPreparation': 'Preparation stage only'");
  });

  it('contains Bật xếp lịch ghi nhớ thử nghiệm', () => {
    expect(panel).toContain("t('settings.fsrsEnable')");
    expect(viCopy).toContain('Bật xếp lịch ghi nhớ thử nghiệm');
  });

  it('does not expose fsrsActiveSchedulingEnabled', () => {
    expect(panel).not.toMatch(/fsrsActiveSchedulingEnabled/);
  });
});

// ── 13. Workflow registers Phase 16E after Phase 16D ─────────────────────────

describe('Phase 16E — workflow registration', () => {
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('workflow includes Phase 16D validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16d-shime-study-identity-product-principles.js');
  });

  it('workflow includes Phase 16E validator', () => {
    expect(workflow).toContain('node scripts/validate-phase16e-visual-polish-quick-wins.js');
  });

  it('Phase 16E validator appears after Phase 16D in workflow', () => {
    const phase16dPos = workflow.indexOf('node scripts/validate-phase16d-shime-study-identity-product-principles.js');
    const phase16ePos = workflow.indexOf('node scripts/validate-phase16e-visual-polish-quick-wins.js');
    expect(phase16dPos).toBeGreaterThan(-1);
    expect(phase16ePos).toBeGreaterThan(phase16dPos);
  });
});
