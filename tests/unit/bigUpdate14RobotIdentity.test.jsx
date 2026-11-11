import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeOledFace, { SHIME_OLED_GEOMETRY } from '../../src/components/brand/ShimeOledFace.jsx';
import ShimeRobotHead, { SHIME_ROBOT_HEAD_SIZES } from '../../src/components/brand/ShimeRobotHead.jsx';
import ShimeRobotPresence from '../../src/components/brand/ShimeRobotPresence.jsx';
import ShimeBrandMark from '../../src/components/brand/ShimeBrandMark.jsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const oledSource = read('src/components/brand/ShimeOledFace.jsx');
const headSource = read('src/components/brand/ShimeRobotHead.jsx');
const presenceSource = read('src/components/brand/ShimeRobotPresence.jsx');
const brandSource = read('src/components/brand/ShimeBrandMark.jsx');
const css = read('src/styles/global.css');
const tokens = read('src/design-system/tokens.css');

describe('BIG-UPDATE-14 canonical OLED geometry', () => {
  it('matches the physical 128x64 neutral and attention geometry exactly', () => {
    expect(SHIME_OLED_GEOMETRY.viewBox).toBe('0 0 128 64');
    expect(SHIME_OLED_GEOMETRY.neutral).toEqual({
      left: { x: 27, y: 14, width: 32, height: 36, radius: 8 },
      right: { x: 69, y: 14, width: 32, height: 36, radius: 8 },
      gap: 10
    });
    expect(SHIME_OLED_GEOMETRY.attention).toEqual({
      left: { x: 25, y: 13, width: 34, height: 38, radius: 8 },
      right: { x: 69, y: 13, width: 34, height: 38, radius: 8 },
      gap: 10
    });
  });

  it('renders canonical neutral eyes as SVG rounded rectangles rather than legacy dot variants', () => {
    const html = renderToStaticMarkup(<ShimeOledFace />);
    expect(html).toContain('viewBox="0 0 128 64"');
    expect(html).toContain('x="27" y="14" width="32" height="36" rx="8"');
    expect(html).toContain('x="69" y="14" width="32" height="36" rx="8"');
    expect(oledSource).not.toMatch(/eyeVariant|dotEye/);
    expect(html).not.toContain('<circle');
  });

  it('supports canonical compact through large heads', () => {
    expect(Object.keys(SHIME_ROBOT_HEAD_SIZES)).toEqual(['compact', 'small', 'medium', 'large']);
    for (const size of Object.keys(SHIME_ROBOT_HEAD_SIZES)) {
      expect(renderToStaticMarkup(<ShimeRobotHead size={size} />)).toContain(`data-robot-head-size="${size}"`);
    }
  });

  it('keeps the companion robot on the OLED head and uses the chosen Shime logo for the brand mark', () => {
    expect(presenceSource).toContain("import ShimeRobotHead");
    expect(headSource).toContain("import ShimeOledFace");
    expect(renderToStaticMarkup(<ShimeRobotPresence />)).toContain('data-oled-viewbox="0 0 128 64"');
    // 2026-11-11: the user chose the "Nháy mắt đúng" (check-wink) logo for the brand mark.
    expect(brandSource).toContain("import ShimeLogoMark");
    expect(renderToStaticMarkup(<ShimeBrandMark />)).toContain('data-shime-logo="check-wink"');
  });
});

describe('BIG-UPDATE-14 theme and expression identity', () => {
  it('defines every launch/OLED role for all five themes', () => {
    for (const role of ['head-surface', 'head-border', 'oled-surface', 'eye', 'eye-soft', 'glow', 'impact-particle', 'message-surface']) {
      expect(tokens.match(new RegExp(`--theme-robot-${role}:`, 'g'))).toHaveLength(5);
    }
  });

  it('uses firmware-style happy and tired masks without correctness colors', () => {
    expect(oledSource).toContain('shimeOledFace__mask--happy');
    expect(oledSource).toContain('shimeOledFace__mask--tired');
    expect(`${oledSource}\n${headSource}`).not.toMatch(/#[0-9a-f]{3,8}\b|status-safe|status-danger/);
    expect(css).not.toMatch(/shimeRobotHead--(?:correct|incorrect)[^}]*status-(?:safe|danger)/);
  });

  it('keeps all robot runtime free of network, sensor, storage, and timer APIs', () => {
    const runtime = `${oledSource}\n${headSource}\n${presenceSource}\n${brandSource}`;
    for (const forbidden of ['fetch(', 'WebSocket', 'navigator.serial', 'navigator.bluetooth', 'getUserMedia', 'localStorage', 'sessionStorage', 'setTimeout', 'setInterval', 'requestAnimationFrame']) {
      expect(runtime).not.toContain(forbidden);
    }
  });
});
