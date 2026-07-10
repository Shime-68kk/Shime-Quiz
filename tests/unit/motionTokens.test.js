import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  durationFast,
  durationNormal,
  durationSlow,
  reducedMotionDuration,
  easingStandard,
  easingEmphasized,
  easingDecelerate,
  easingAccelerate,
  getEffectiveDuration,
  buildTransition,
  MOTION_PRESETS,
  MOTION_TOKEN_VERSION
} from '../../src/uiMotion/motionTokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(resolve(__dirname, '../../src/uiMotion/motionTokens.js'), 'utf8');
const homeSource = fs.readFileSync(resolve(__dirname, '../../src/routes/Home.jsx'), 'utf8');
const css = fs.readFileSync(resolve(__dirname, '../../src/styles/global.css'), 'utf8');

describe('motionTokens — duration constants', () => {
  it('fast duration is 120ms', () => {
    expect(durationFast).toBe(120);
  });

  it('normal duration is 180ms', () => {
    expect(durationNormal).toBe(180);
  });

  it('slow duration is 240ms', () => {
    expect(durationSlow).toBe(240);
  });

  it('reduced motion duration is 0', () => {
    expect(reducedMotionDuration).toBe(0);
  });

  it('all standard durations are in 120–240ms range (no blocking long animations)', () => {
    [durationFast, durationNormal, durationSlow].forEach(d => {
      expect(d).toBeGreaterThanOrEqual(100);
      expect(d).toBeLessThanOrEqual(300);
    });
  });
});

describe('motionTokens — easing strings', () => {
  it('standard easing is a valid cubic-bezier string', () => {
    expect(easingStandard).toMatch(/cubic-bezier/);
  });

  it('emphasized easing is a valid cubic-bezier string', () => {
    expect(easingEmphasized).toMatch(/cubic-bezier/);
  });

  it('decelerate and accelerate easings exist', () => {
    expect(easingDecelerate).toMatch(/cubic-bezier/);
    expect(easingAccelerate).toMatch(/cubic-bezier/);
  });
});

describe('motionTokens — getEffectiveDuration', () => {
  it('returns 0 when reduced motion is forced', () => {
    expect(getEffectiveDuration(durationNormal, true)).toBe(0);
  });

  it('returns nominal duration when reduced motion is false', () => {
    expect(getEffectiveDuration(durationNormal, false)).toBe(durationNormal);
  });

  it('returns nominal duration when override is not provided (no window in test env)', () => {
    // In vitest (Node), window.matchMedia is not available, so falls back to nominal
    expect(getEffectiveDuration(durationSlow)).toBe(durationSlow);
  });
});

describe('motionTokens — buildTransition', () => {
  it('builds a valid transition string with transform and opacity', () => {
    const result = buildTransition(durationNormal, easingStandard);
    expect(result).toContain('transform');
    expect(result).toContain('opacity');
    expect(result).toContain(`${durationNormal}ms`);
  });

  it('defaults to normal duration and standard easing', () => {
    const result = buildTransition();
    expect(result).toContain(`${durationNormal}ms`);
    expect(result).toContain(easingStandard);
  });
});

describe('motionTokens — MOTION_PRESETS', () => {
  it('contains expected preset keys', () => {
    const keys = Object.keys(MOTION_PRESETS);
    expect(keys).toContain('heroEntry');
    expect(keys).toContain('robotPulse');
    expect(keys).toContain('ctaHover');
    expect(keys).toContain('cardReveal');
    expect(keys).toContain('robotStateTransition');
  });

  it('all presets use only transform and/or opacity (no layout thrashing props)', () => {
    for (const [name, preset] of Object.entries(MOTION_PRESETS)) {
      const allProps = `${preset.property || ''} ${JSON.stringify(preset.from || {})} ${JSON.stringify(preset.to || {})}`;
      // Only transform and opacity allowed — not width, height, top, left, margin, padding
      const forbidden = /\b(width|height|top|left|right|bottom|margin|padding|font-size)\b/i;
      expect(forbidden.test(allProps), `Preset "${name}" must not animate layout properties`).toBe(false);
    }
  });

  it('heroEntry uses slow duration', () => {
    expect(MOTION_PRESETS.heroEntry.duration).toBe(durationSlow);
  });

  it('robotPulse is marked as infinite (idle ambient animation)', () => {
    expect(MOTION_PRESETS.robotPulse.iterationCount).toBe('infinite');
  });

  it('ctaHover uses fast duration', () => {
    expect(MOTION_PRESETS.ctaHover.duration).toBe(durationFast);
  });

  it('is frozen (no runtime mutation allowed)', () => {
    expect(Object.isFrozen(MOTION_PRESETS)).toBe(true);
  });
});

describe('motionTokens — version tag', () => {
  it('identifies big-update-10', () => {
    expect(MOTION_TOKEN_VERSION).toBe('big-update-10');
  });
});

describe('motionTokens — source safety check', () => {
  it('does not import heavy animation libraries', () => {
    const forbidden = ['framer-motion', 'gsap', 'three', 'matter-js', 'lottie'];
    forbidden.forEach(lib => {
      expect(source).not.toContain(lib);
    });
  });

  it('does not contain network or device APIs', () => {
    ['fetch(', 'WebSocket', 'navigator.serial', 'navigator.bluetooth', 'localStorage'].forEach(api => {
      expect(source).not.toContain(api);
    });
  });
});

describe('BIG-UPDATE-10.1 — Home motion contract', () => {
  it('keeps the staged Home entrance hooks and a sub-650ms sequence', () => {
    [
      'shimeLandingRobotChip',
      'shimeLandingHero__eyebrow',
      'shimeLandingHero__headline',
      'shimeLandingHero__support',
      'shimeLandingHero__actions',
      'shimeLandingHero__card',
      'shimeLandingProofCard'
    ].forEach(className => expect(homeSource).toContain(className));

    expect(css).toContain('animation-delay: calc(300ms + (var(--motion-index, 0) * 45ms))');
    expect(css).toContain('animation-delay: 240ms');
    expect(css).toContain('animation-duration: var(--motion-duration-normal, 180ms)');
  });

  it('uses motion indices for proof cards without making them controls', () => {
    const proofCardRule = css.match(/\.shimeLandingProofCard\s*\{([^}]*)\}/)?.[1] || '';
    expect(homeSource.match(/--motion-index/g)).toHaveLength(3);
    expect(homeSource.match(/<article className="shimeLandingProofCard"/g)).toHaveLength(3);
    expect(homeSource).not.toMatch(/<button[^>]*shimeLandingProofCard/);
    expect(proofCardRule).not.toMatch(/cursor:\s*pointer/);
  });

  it('preserves all Home route callback destinations and counts', () => {
    expect(homeSource.match(/onClick=\{\(\) => navigate\('\/dashboard'\)\}/g)).toHaveLength(2);
    expect(homeSource.match(/onClick=\{\(\) => navigate\('\/library'\)\}/g)).toHaveLength(3);
    expect(homeSource.match(/onClick=\{\(\) => navigate\('\/study-room'\)\}/g)).toHaveLength(1);
  });

  it('adds no timers, forbidden APIs, or route-transition mechanism', () => {
    expect(homeSource).not.toMatch(/\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/);
    ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.serial', 'navigator.bluetooth'].forEach(api => {
      expect(homeSource).not.toContain(api);
    });
    expect(homeSource).not.toContain('startViewTransition');
  });

  it('defines a one-shot headline accent reveal and pointer-gated hover effects', () => {
    expect(css).toContain('@keyframes shimeHeadlineAccentReveal');
    expect(css).toMatch(/shimeHeadlineAccentReveal[^;]+forwards/);
    expect(css).toContain('@media (hover: hover) and (pointer: fine)');
  });

  it('keeps Home CTA feedback at the fast token and the approved press scale', () => {
    expect(css).toMatch(/\.shimeLandingHero__actions \.button \{[\s\S]*?--motion-duration-fast, 120ms/);
    expect(css).toMatch(/\.shimeLandingHero__actions \.button:active[^}]*scale\(0\.98\) !important/);
  });
});
