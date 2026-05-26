/**
 * Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot
 *
 * Static source analysis only. No jsdom rendering.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Expected file not found: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

const bottomNav = read('src/layout/BottomNav.jsx');
const css = read('src/styles/global.css');
const routes = read('src/routes/routeConfig.js');

describe('Phase 36B — bottom nav route preservation', () => {
  it('keeps route-driven NavLink destinations, active-index logic, and no click handlers', () => {
    expect(bottomNav).toContain("import { navRoutes } from '../routes/routeConfig.js'");
    expect(bottomNav).toContain('navRoutes.findIndex');
    expect(bottomNav).toContain('item.path === location.pathname');
    expect(bottomNav).toContain('to={item.path}');
    expect(bottomNav).toMatch(/className=\{\(\{ isActive \}\) =>/);
    expect(bottomNav).toContain('--nav-active-index');
    expect(bottomNav).toContain('--nav-item-count');
    expect(bottomNav).not.toContain('onClick=');
    expect(bottomNav).not.toContain('navigate(');
  });

  it('keeps the existing visible nav route labels and paths untouched', () => {
    for (const expected of [
      "path: '/dashboard'",
      "path: '/library'",
      "path: '/study-room'",
      "path: '/settings'",
      "label: 'Tổng quan'",
      "label: 'Thư viện'",
      "label: 'Phòng học'",
      "label: 'Cài đặt'"
    ]) {
      expect(routes).toContain(expected);
    }
  });
});

describe('Phase 36B — mobile touch comfort and safe-area styling', () => {
  it('adds a bottom-nav-only Phase 36B pilot hook and scoped CSS', () => {
    expect(bottomNav).toContain('phase36b-bottom-nav-touch-pilot');
    expect(css).toContain('.bottomNav.phase36b-bottom-nav-touch-pilot');
    expect(css).toContain('--phase36b-bottom-nav-safe-area');
  });

  it('keeps comfortable touch targets, safe-area padding, and no horizontal overflow assumptions', () => {
    expect(css).toMatch(/\.bottomNav\.phase36b-bottom-nav-touch-pilot[\s\S]*min-height:\s*calc\(var\(--bottom-nav-height\) - 8px \+ var\(--phase36b-bottom-nav-safe-area\)\)/);
    expect(css).toMatch(/\.bottomNav\.phase36b-bottom-nav-touch-pilot[\s\S]*padding:\s*10px 10px calc\(10px \+ var\(--phase36b-bottom-nav-safe-area\)\)/);
    expect(css).toMatch(/\.bottomNav\.phase36b-bottom-nav-touch-pilot \.bottomNav__item[\s\S]*min-height:\s*52px/);
    expect(css).toContain('@media (max-width: 380px)');
    expect(css).toMatch(/\.bottomNav[\s\S]*right:\s*8px;[\s\S]*left:\s*8px;/);
  });

  it('preserves focus-visible and reduced-motion behavior', () => {
    expect(css).toMatch(/\.bottomNav__item:focus-visible/);
    expect(css).toContain('outline: 3px solid var(--color-focus)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/\.primaryNavSlidingIndicator,[\s\S]*\.bottomNav__item[\s\S]*transition: none;/);
  });
});
