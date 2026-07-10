import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeRobotPresence from '../../src/components/brand/ShimeRobotPresence.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(resolve(__dirname, '../../src/components/brand/ShimeRobotPresence.jsx'), 'utf8');
const css = fs.readFileSync(resolve(__dirname, '../../src/styles/global.css'), 'utf8');
const homeMotionStart = css.indexOf('BIG-UPDATE-10: Premium Shime Landing Page Styles');
const homeMotionEnd = css.indexOf('.storageQuotaWarning', homeMotionStart);
const homeMotionCss = css.slice(homeMotionStart, homeMotionEnd);
const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)', homeMotionStart);
const reducedMotionEnd = css.indexOf('/* ── Responsive: Proof grid ── */', reducedMotionStart);
const reducedMotionCss = css.slice(reducedMotionStart, reducedMotionEnd);

function render(props = {}) {
  return renderToStaticMarkup(React.createElement(ShimeRobotPresence, props));
}

describe('ShimeRobotPresence — rendering', () => {
  it('renders without crashing (default props)', () => {
    const html = render();
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(10);
  });

  it('renders all 5 states without crashing', () => {
    ['idle', 'ready', 'focus', 'success', 'warning'].forEach(state => {
      const html = render({ state });
      expect(html).toBeTruthy();
    });
  });

  it('renders all 3 sizes without crashing', () => {
    ['sm', 'md', 'lg'].forEach(size => {
      const html = render({ size });
      expect(html).toBeTruthy();
    });
  });
});

describe('ShimeRobotPresence — accessibility', () => {
  it('is aria-hidden by default (decorative=true)', () => {
    const html = render({ decorative: true });
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });

  it('exposes role="img" and aria-label when non-decorative with label', () => {
    const html = render({ decorative: false, label: 'Robot Shime trợ lý' });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Robot Shime trợ lý"');
  });

  it('uses default state label when non-decorative without explicit label', () => {
    const html = render({ decorative: false, state: 'idle' });
    expect(html).toContain('role="img"');
    // Should have some aria-label from config
    expect(html).toMatch(/aria-label/);
  });

  it('never exposes raw quiz content in any state', () => {
    ['idle', 'ready', 'focus', 'success', 'warning'].forEach(state => {
      const html = render({ state, decorative: false });
      ['correctAnswer', 'userAnswer', 'quizContent', 'explanation', 'importedText'].forEach(forbidden => {
        expect(html).not.toContain(forbidden);
      });
    });
  });
});

describe('ShimeRobotPresence — state data attributes', () => {
  it('attaches data-robot-state to the container', () => {
    ['idle', 'ready', 'focus', 'success', 'warning'].forEach(state => {
      const html = render({ state });
      expect(html).toContain(`data-robot-state="${state}"`);
    });
  });

  it('attaches data-robot-size to the container', () => {
    ['sm', 'md', 'lg'].forEach(size => {
      const html = render({ size });
      expect(html).toContain(`data-robot-size="${size}"`);
    });
  });
});

describe('ShimeRobotPresence — reduced motion', () => {
  it('does not apply pulse class when reducedMotion=true', () => {
    const idleHtml = render({ state: 'idle', reducedMotion: true });
    expect(idleHtml).not.toContain('--pulse');
  });

  it('applies pulse class in idle state without reducedMotion override', () => {
    const idleHtml = render({ state: 'idle', reducedMotion: false });
    expect(idleHtml).toContain('--pulse');
  });

  it('does not apply pulse in non-idle states regardless of reducedMotion', () => {
    ['ready', 'focus', 'success', 'warning'].forEach(state => {
      const html = render({ state, reducedMotion: false });
      expect(html).not.toContain('--pulse');
    });
  });

  it('adds an explicit reduced-motion class when the prop is enabled', () => {
    const html = render({ reducedMotion: true });
    expect(html).toContain('shimeRobotPresence--reduced-motion');
  });
});

describe('ShimeRobotPresence — calm CSS motion', () => {
  it('renders eye hooks and defines a sparse blink keyframe', () => {
    const html = render({ state: 'ready' });
    expect(html.match(/shimeRobotPresence__eye/g)).toHaveLength(2);
    expect(css).toContain('@keyframes shimeRobotEyeBlink');
    expect(css).toContain('scaleY(0.12)');
    expect(css).toMatch(/shimeRobotEyeBlink 6\.8s linear infinite/);
  });

  it('keeps ambient movement within the approved amplitude', () => {
    expect(homeMotionCss).toContain('translateY(-1.5px) scale(1.008)');
    expect(homeMotionCss).toContain('scale(1.005)');
    expect(homeMotionCss).not.toContain('rotate(');
  });

  it('disables blink, ambient presence, and glow under reduced motion', () => {
    expect(reducedMotionStart).toBeGreaterThan(-1);
    expect(reducedMotionCss).toMatch(/\.shimeRobotPresence__eye\s*\{[\s\S]*?animation: none !important/);
    expect(reducedMotionCss).toMatch(/\.shimeRobotPresence,[\s\S]*?animation: none !important/);
    expect(reducedMotionCss).toContain('.shimeRobotPresence__glow--pulse');
  });

  it('does not introduce JavaScript animation timers', () => {
    expect(source).not.toMatch(/\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/);
  });
});

describe('ShimeRobotPresence — source safety', () => {
  it('does not use network APIs', () => {
    ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.serial', 'navigator.bluetooth'].forEach(api => {
      expect(source).not.toContain(api);
    });
  });

  it('does not use storage APIs', () => {
    ['localStorage', 'sessionStorage', 'indexedDB'].forEach(api => {
      expect(source).not.toContain(api);
    });
  });

  it('does not leak raw quiz content identifiers', () => {
    ['correctAnswer', 'rawQuizPayload', 'importedDocumentText', 'explanation'].forEach(field => {
      expect(source).not.toContain(field);
    });
  });

  it('does not import heavy animation libraries', () => {
    ['framer-motion', 'gsap', 'three', 'lottie', 'matter-js'].forEach(lib => {
      expect(source).not.toContain(lib);
    });
  });

  it('does not use canvas or WebGL', () => {
    expect(source).not.toContain('getContext(');
    expect(source).not.toContain('WebGL');
    expect(source).not.toContain('canvas');
  });
});
