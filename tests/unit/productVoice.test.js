import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  HERO_COPY,
  PROOF_PANEL_COPY,
  SHARED_LABELS,
  PRIVACY_COPY,
  EMPTY_STATE_COPY,
  getCopy,
  VOICE_RULES,
  PRODUCT_VOICE_VERSION
} from '../../src/copy/productVoice.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(resolve(__dirname, '../../src/copy/productVoice.js'), 'utf8');

describe('productVoice — version', () => {
  it('identifies big-update-10', () => {
    expect(PRODUCT_VOICE_VERSION).toBe('big-update-10');
  });
});

describe('productVoice — HERO_COPY', () => {
  it('has vi and en locales', () => {
    expect(HERO_COPY.vi).toBeDefined();
    expect(HERO_COPY.en).toBeDefined();
  });

  it('vi headline includes local-first message', () => {
    expect(HERO_COPY.vi.headline).toMatch(/cục bộ|local/i);
  });

  it('vi has primary, secondary, ghost CTA labels', () => {
    expect(HERO_COPY.vi.ctaPrimary).toBeTruthy();
    expect(HERO_COPY.vi.ctaSecondary).toBeTruthy();
    expect(HERO_COPY.vi.ctaGhost).toBeTruthy();
  });

  it('robot caption does not imply robot sees or hears user', () => {
    const caption = HERO_COPY.vi.robotCaption + HERO_COPY.en.robotCaption;
    expect(caption).not.toMatch(/robot (?:sees?|hears?|listens?|watches?)/i);
  });

  it('does not claim real robot bridge is active', () => {
    const all = JSON.stringify(HERO_COPY);
    expect(all).not.toMatch(/real robot bridge is (?:now )?active|real bridge connected/i);
  });
});

describe('productVoice — PROOF_PANEL_COPY', () => {
  it('has four panels: localFirst, subjectRooms, privacy, reviewReminder', () => {
    const keys = Object.keys(PROOF_PANEL_COPY.vi);
    expect(keys).toContain('localFirst');
    expect(keys).toContain('subjectRooms');
    expect(keys).toContain('privacy');
    expect(keys).toContain('reviewReminder');
  });

  it('privacy panel states robot receives only safe signals', () => {
    const body = PROOF_PANEL_COPY.vi.privacy.body;
    expect(body).toMatch(/tín hiệu|signal/i);
    expect(body).toMatch(/không nhận|không.*nội dung|never.*content/i);
  });

  it('localFirst panel mentions no backend/cloud', () => {
    const body = PROOF_PANEL_COPY.vi.localFirst.body;
    expect(body).toMatch(/không.*backend|không.*cloud/i);
  });
});

describe('productVoice — SHARED_LABELS', () => {
  it('has canonical navigation labels in Vietnamese', () => {
    const vi = SHARED_LABELS.vi;
    expect(vi.dashboard).toBe('Tổng quan');
    expect(vi.library).toBe('Thư viện');
    expect(vi.studyRoom).toBe('Phòng học');
    expect(vi.settings).toBe('Cài đặt');
  });

  it('notSent label is correct', () => {
    expect(SHARED_LABELS.vi.notSent).toBe('không gửi');
    expect(SHARED_LABELS.en.notSent).toBe('not sent');
  });

  it('redactedCoarseData label is correct', () => {
    expect(SHARED_LABELS.vi.redactedCoarseData).toBe('dữ liệu đã làm mờ/rút gọn');
    expect(SHARED_LABELS.en.redactedCoarseData).toBe('redacted/coarse data');
  });
});

describe('productVoice — PRIVACY_COPY', () => {
  it('states robot receives only safe signals in vi', () => {
    expect(PRIVACY_COPY.vi.robotSafeSignal).toMatch(/tín hiệu an toàn|safe signal/i);
  });

  it('states dry-run means no real command sent', () => {
    const dryRun = PRIVACY_COPY.vi.dryRunOnly + PRIVACY_COPY.en.dryRunOnly;
    expect(dryRun).toMatch(/dry.run|thử khô/i);
    expect(dryRun).toMatch(/không gửi|no real command/i);
  });

  it('states real robot bridge is not active', () => {
    const both = PRIVACY_COPY.vi.noRealRobotBridge + PRIVACY_COPY.en.noRealRobotBridge;
    expect(both).toMatch(/chưa hoạt động|not active/i);
  });
});

describe('productVoice — getCopy', () => {
  it('returns vi by default', () => {
    expect(getCopy(HERO_COPY)).toBe(HERO_COPY.vi);
  });

  it('returns en when requested', () => {
    expect(getCopy(HERO_COPY, 'en')).toBe(HERO_COPY.en);
  });

  it('falls back to vi for unknown locales', () => {
    expect(getCopy(HERO_COPY, 'fr')).toBe(HERO_COPY.vi);
    expect(getCopy(HERO_COPY, 'ja')).toBe(HERO_COPY.vi);
  });
});

describe('productVoice — VOICE_RULES', () => {
  it('has rules array with required checks', () => {
    const ids = VOICE_RULES.map(r => r.id);
    expect(ids).toContain('no-cloud-claim');
    expect(ids).toContain('no-ai-api-claim');
    expect(ids).toContain('no-ocr-claim');
    expect(ids).toContain('no-robot-sense');
    expect(ids).toContain('no-real-bridge-active');
  });

  it('each rule has a forbidden pattern and reason', () => {
    VOICE_RULES.forEach(rule => {
      expect(rule.forbidden).toBeInstanceOf(RegExp);
      expect(typeof rule.reason).toBe('string');
      expect(rule.reason.length).toBeGreaterThan(0);
    });
  });

  it('product voice copy file itself does not violate the voice rules', () => {
    VOICE_RULES.forEach(rule => {
      expect(
        rule.forbidden.test(source),
        `Source violates voice rule "${rule.id}": ${rule.reason}`
      ).toBe(false);
    });
  });
});

describe('productVoice — source safety', () => {
  it('does not contain network APIs', () => {
    ['fetch(', 'WebSocket', 'XMLHttpRequest', 'navigator.serial'].forEach(api => {
      expect(source).not.toContain(api);
    });
  });

  it('does not contain storage calls', () => {
    ['localStorage', 'sessionStorage', 'indexedDB'].forEach(api => {
      expect(source).not.toContain(api);
    });
  });
});
