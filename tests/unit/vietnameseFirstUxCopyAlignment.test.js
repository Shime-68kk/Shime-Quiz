/**
 * tests/unit/vietnameseFirstUxCopyAlignment.test.js
 *
 * Phase 16A — Vietnamese-First UX Copy / Button Terminology Alignment.
 *
 * Pure static-source assertions: no jsdom, no DOM rendering. Each check
 * confirms that high-impact user-facing UI files contain the expected
 * Vietnamese-first wording and do not leak forbidden internal/technical
 * identifiers, AI/FSRS/sync rollout claims, or i18n-framework artefacts.
 */

import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(resolve(PROJECT_ROOT, relativePath));
}

// ── 1. Main navigation labels stay Vietnamese ────────────────────────────────

describe('Phase 16A — main navigation uses Vietnamese labels', () => {
  const routeConfig = read('src/routes/routeConfig.js');

  it('navigation registers Tổng quan for /dashboard', () => {
    expect(routeConfig).toMatch(/path:\s*'\/dashboard'[\s\S]*label:\s*'Tổng quan'/);
  });

  it('navigation registers Thư viện for /library', () => {
    expect(routeConfig).toMatch(/path:\s*'\/library'[\s\S]*label:\s*'Thư viện'/);
  });

  it('navigation registers Phòng học for /study-room', () => {
    expect(routeConfig).toMatch(/path:\s*'\/study-room'[\s\S]*label:\s*'Phòng học'/);
  });

  it('navigation registers Cài đặt for /settings', () => {
    expect(routeConfig).toMatch(/path:\s*'\/settings'[\s\S]*label:\s*'Cài đặt'/);
  });
});

// ── 2. Home / landing page leads with Vietnamese CTAs ───────────────────────

describe('Phase 16A — Home landing CTAs are Vietnamese-first', () => {
  const home = read('src/routes/Home.jsx');

  it('hero CTA reads Mở Tổng quan (not Mở Dashboard)', () => {
    expect(home).toContain('Mở Tổng quan');
    expect(home).not.toContain('Mở Dashboard');
  });

  it('hero CTA reads Mở Thư viện (not Mở Library)', () => {
    expect(home).toContain('Mở Thư viện');
    expect(home).not.toContain('Mở Library');
  });

  it('navigation footer references Phòng học / Thư viện / Tổng quan', () => {
    expect(home).toContain('Phòng học');
    expect(home).toContain('Thư viện');
    expect(home).toContain('Tổng quan');
  });

  it('keeps Dùng quiz mẫu demo CTA', () => {
    expect(home).toContain('Dùng quiz mẫu');
  });
});

// ── 3. FSRS memory-rating bridge surfaces Vietnamese terminology ─────────────

describe('Phase 16A — memory-rating bridge uses Vietnamese terms', () => {
  const bridge = read('src/components/study/FsrsProductionMemoryRatingBridge.jsx');

  it('renders the Vietnamese header term Mức độ nhớ', () => {
    expect(bridge).toContain('Mức độ nhớ');
  });

  it('renders Vietnamese effort labels Nhớ khó / Nhớ được / Nhớ dễ', () => {
    expect(bridge).toContain('Nhớ khó');
    expect(bridge).toContain('Nhớ được');
    expect(bridge).toContain('Nhớ dễ');
  });

  it('renders Vietnamese skip button label Tiếp tục không đánh giá', () => {
    expect(bridge).toContain('Tiếp tục không đánh giá');
  });

  it('does not render forbidden internal identifier fsrsActiveSchedulingEnabled as JSX text', () => {
    expect(bridge).not.toMatch(/>\s*fsrsActiveSchedulingEnabled\s*</);
  });

  it('does not render schedulerKind / fsrsPayload / ts-fsrs as user-facing text', () => {
    expect(bridge).not.toMatch(/>\s*schedulerKind\s*</);
    expect(bridge).not.toMatch(/>\s*fsrsPayload\s*</);
    expect(bridge).not.toMatch(/>\s*ts-fsrs\s*</);
  });
});

// ── 4. Settings experimental panel uses Vietnamese-first labels ──────────────

describe('Phase 16A — settings panel is Vietnamese-first', () => {
  const panel = read('src/components/settings/FsrsExperimentalSettingsPanel.jsx');

  it('panel title uses Vietnamese xếp lịch ghi nhớ thử nghiệm', () => {
    expect(panel).toContain('Bật xếp lịch ghi nhớ thử nghiệm');
  });

  it('panel preparation badge uses Vietnamese Chỉ là giai đoạn chuẩn bị', () => {
    expect(panel).toContain('Chỉ là giai đoạn chuẩn bị');
  });

  it('does not expose fsrsActiveSchedulingEnabled in user-facing UI', () => {
    expect(panel).not.toMatch(/fsrsActiveSchedulingEnabled/);
  });

  it('does not render schedulerKind / fsrsPayload / ts-fsrs as JSX text', () => {
    expect(panel).not.toMatch(/schedulerKind/);
    expect(panel).not.toMatch(/fsrsPayload/);
    expect(panel).not.toMatch(/ts-fsrs/);
  });
});

// ── 5. Study Room uses Vietnamese-first navigation copy ─────────────────────

describe('Phase 16A — Study Room uses Vietnamese-first action labels', () => {
  const room = read('src/routes/StudyRoom.jsx');

  it('replaces stepper labels with Vietnamese Câu trước / Câu tiếp theo', () => {
    expect(room).toContain('Câu trước');
    expect(room).toContain('Câu tiếp theo');
    expect(room).not.toContain('Item trước');
    expect(room).not.toContain('Item tiếp theo');
  });

  it('replaces Lựa chọn từ Library with Lựa chọn từ Thư viện', () => {
    expect(room).toContain('Lựa chọn từ Thư viện');
    expect(room).not.toContain('Lựa chọn từ Library');
  });

  it('does not render fsrsActiveSchedulingEnabled as user-facing JSX text', () => {
    expect(room).not.toMatch(/>\s*fsrsActiveSchedulingEnabled\s*</);
  });
});

// ── 6. Dashboard mixed-scheduler note no longer carries trailing English ────

describe('Phase 16A — Dashboard mixed-scheduler note is Vietnamese-only', () => {
  const dashboard = read('src/routes/Dashboard.jsx');

  it('drops the trailing English mixed-scheduler hint', () => {
    expect(dashboard).not.toContain('Some cards may use experimental memory scheduling.');
  });

  it('keeps the Vietnamese mixed-scheduler note', () => {
    expect(dashboard).toContain('Bao gồm');
    expect(dashboard).toContain('thẻ dùng lịch học bộ nhớ thử nghiệm');
  });
});

// ── 7. No broad AI / FSRS / sync / EduGen rollout claims ────────────────────

describe('Phase 16A — claim guardrails preserved', () => {
  const FORBIDDEN_CLAIMS = [
    'AI scheduling enabled',
    'AI scheduling is enabled',
    'FSRS active for everyone',
    'FSRS is active for everyone',
    'cloud sync enabled',
    'cloud sync is enabled',
    'EduGen bundled',
    'EduGen is bundled',
    'built-in OCR',
    'OCR enabled'
  ];

  const SURFACE_FILES = [
    'src/routes/Home.jsx',
    'src/routes/Dashboard.jsx',
    'src/routes/Library.jsx',
    'src/routes/StudyRoom.jsx',
    'src/routes/Settings.jsx',
    'src/components/study/FsrsProductionMemoryRatingBridge.jsx',
    'src/components/settings/FsrsExperimentalSettingsPanel.jsx'
  ];

  for (const file of SURFACE_FILES) {
    it(`${file} does not introduce broad rollout claims`, () => {
      const source = read(file);
      for (const claim of FORBIDDEN_CLAIMS) {
        expect(source).not.toContain(claim);
      }
    });
  }
});

// ── 8. No i18n framework / language switcher / locale settings introduced ───

describe('Phase 16A — no i18n framework introduced', () => {
  const pkg = JSON.parse(read('package.json'));

  it('package.json has no i18n-style runtime dependency', () => {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const FORBIDDEN = ['i18next', 'react-i18next', 'lingui', '@formatjs/intl', 'vue-i18n', 'next-intl', 'react-intl'];
    for (const name of FORBIDDEN) {
      expect(deps[name]).toBeUndefined();
    }
  });

  it('settingsStorage does not introduce a language/locale key', () => {
    const source = read('src/state/settingsStorage.js');
    expect(source).not.toMatch(/\blanguage\b\s*:/);
    expect(source).not.toMatch(/\blocale\b\s*:/);
    expect(source).not.toMatch(/i18n/i);
  });

  it('no LanguageSwitcher / language-switcher component exists in src/', () => {
    const candidates = [
      'src/components/LanguageSwitcher.jsx',
      'src/components/language/LanguageSwitcher.jsx',
      'src/i18n.js',
      'src/locales'
    ];
    for (const candidate of candidates) {
      expect(exists(candidate)).toBe(false);
    }
  });
});

// ── 9. Doc and validator presence ───────────────────────────────────────────

describe('Phase 16A — doc and validator presence', () => {
  it('Phase 16A doc exists with the required scope statements', () => {
    const doc = read('docs/phase16a-vietnamese-first-ux-copy-alignment.md');
    expect(doc).toContain('Phase 16A');
    expect(doc).toContain('Vietnamese');
    expect(doc).toMatch(/not\s+a\s+full\s+i18n|not full i18n|không phải.*i18n/i);
    expect(doc).toMatch(/no language switcher|không.*language switcher|No language switcher/i);
    expect(doc).toMatch(/Phase 16B/);
    expect(doc).toMatch(/Mức độ nhớ/);
  });

  it('Phase 16A validator script exists', () => {
    expect(exists('scripts/validate-phase16a-vietnamese-first-ux-copy-alignment.js')).toBe(true);
  });

  it('Phase 16A validator is registered in CI workflow after Phase 15H', () => {
    const workflow = read('.github/workflows/e2e-smoke.yml');
    const phase15hPos = workflow.indexOf('validate-phase15h-fsrs-foundation-closure-phase16-readiness.js');
    const phase16aPos = workflow.indexOf('validate-phase16a-vietnamese-first-ux-copy-alignment.js');
    expect(phase15hPos).toBeGreaterThan(-1);
    expect(phase16aPos).toBeGreaterThan(phase15hPos);
  });
});
