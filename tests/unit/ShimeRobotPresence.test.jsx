import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeRobotPresence from '../../src/components/brand/ShimeRobotPresence.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(resolve(__dirname, '../../src/components/brand/ShimeRobotPresence.jsx'), 'utf8');
const faceSource = fs.readFileSync(resolve(__dirname, '../../src/components/brand/ShimeRobotFace.jsx'), 'utf8');
const oledSource = fs.readFileSync(resolve(__dirname, '../../src/components/brand/ShimeOledFace.jsx'), 'utf8');
const headSource = fs.readFileSync(resolve(__dirname, '../../src/components/brand/ShimeRobotHead.jsx'), 'utf8');
const css = fs.readFileSync(resolve(__dirname, '../../src/styles/global.css'), 'utf8');
const homeMotionStart = css.indexOf('BIG-UPDATE-10: Premium Shime Landing Page Styles');
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
    Object.entries({ sm: 'small', md: 'medium', lg: 'large' }).forEach(([size, normalized]) => {
      const html = render({ size });
      expect(html).toContain(`data-robot-size="${normalized}"`);
    });
  });
});

describe('ShimeRobotPresence — reduced motion', () => {
  it('does not activate arrival eye motion when reducedMotion=true', () => {
    const html = render({ state: 'idle', arrival: true, gaze: 'action', reducedMotion: true });
    expect(html).not.toContain('shimeRobotFace__eye--arrival-wink');
    expect(html).not.toContain('shimeRobotFace__eye--arrival-gaze');
  });

  it('keeps both hardware eyes present in reduced motion', () => {
    const html = render({ reducedMotion: true });
    expect(html).toContain('viewBox="0 0 128 64"');
    expect(html).toContain('x="27" y="14" width="32" height="36" rx="8"');
    expect(html).toContain('x="69" y="14" width="32" height="36" rx="8"');
    expect(html).toContain('data-eye-variant="oled"');
  });

  it('does not add continuous-motion classes in any state', () => {
    ['ready', 'focus', 'success', 'warning'].forEach(state => {
      const html = render({ state, reducedMotion: false });
      expect(html).not.toContain('--pulse');
      expect(html).not.toContain('shimeRobotEyeBlink');
    });
  });

  it('adds an explicit reduced-motion class when the prop is enabled', () => {
    const html = render({ reducedMotion: true });
    expect(html).toContain('shimeRobotPresence--reduced-motion');
  });
});

describe('ShimeRobotPresence — calm CSS motion', () => {
  it('renders canonical OLED eye hooks with sparse CSS motion', () => {
    const html = render({ state: 'ready' });
    expect(html).toContain('shimeOledFace__eye--left');
    expect(html).toContain('shimeOledFace__eye--right');
    expect(css).toContain('@keyframes shimeOledIdleBlink');
    expect(css).toContain('scaleY(0.04)');
  });

  it('does not apply continuous ambient movement to the robot', () => {
    const presenceRule = css.match(/\.shimeRobotPresence\s*\{([^}]*)\}/)?.[1] || '';
    const glowRule = css.match(/\.shimeRobotPresence__glow\s*\{([^}]*)\}/)?.[1] || '';
    expect(presenceRule).not.toContain('animation:');
    expect(glowRule).not.toContain('animation:');
  });

  it('disables eye, arrival, and face transforms under reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion:[\s\S]*?\.shimeRobotPresence \.shimeRobotHead,[\s\S]*?animation: none !important/);
    expect(css).toContain('.shimeOledFace__eyeGeometry');
  });

  it('does not introduce JavaScript animation timers', () => {
    expect(`${source}\n${faceSource}\n${oledSource}\n${headSource}`).not.toMatch(/\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/);
  });
});

describe('ShimeRobotPresence — source safety', () => {
  it('does not use network APIs', () => {
    ['fetch(', 'XMLHttpRequest', 'WebSocket', 'navigator.serial', 'navigator.bluetooth'].forEach(api => {
      expect(`${source}\n${faceSource}`).not.toContain(api);
    });
  });

  it('does not use storage APIs', () => {
    ['localStorage', 'sessionStorage', 'indexedDB'].forEach(api => {
      expect(`${source}\n${faceSource}`).not.toContain(api);
    });
  });

  it('does not leak raw quiz content identifiers', () => {
    ['correctAnswer', 'rawQuizPayload', 'importedDocumentText', 'explanation'].forEach(field => {
      expect(`${source}\n${faceSource}`).not.toContain(field);
    });
  });

  it('does not import heavy animation libraries', () => {
    ['framer-motion', 'gsap', 'three', 'lottie', 'matter-js'].forEach(lib => {
      expect(`${source}\n${faceSource}`).not.toContain(lib);
    });
  });

  it('does not use canvas or WebGL', () => {
    expect(`${source}\n${faceSource}`).not.toContain('getContext(');
    expect(`${source}\n${faceSource}`).not.toContain('WebGL');
    expect(`${source}\n${faceSource}`).not.toContain('canvas');
  });
});
