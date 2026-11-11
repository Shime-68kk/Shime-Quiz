/**
 * Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot
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

const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');
const css = read('src/styles/global.css');
const workflow = read('.github/workflows/e2e-smoke.yml');
const validator = read('scripts/validate-phase37-uih-hybrid-sliding-navigation-indicator-pilot.js');

describe('BIG-UPDATE-13 — superseded sliding navigation indicator', () => {
  it('retains historical host markers but removes moving indicator instances', () => {
    expect(sidebar).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop');
    expect(bottomNav).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile');
    expect(sidebar).not.toContain('primaryNavSlidingIndicator');
    expect(bottomNav).not.toContain('primaryNavSlidingIndicator');
  });

  it('uses NavLink active state without index choreography or click handlers', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('NavLink');
      expect(source).toContain('to={item.path}');
      expect(source).not.toContain('onClick=');
      expect(source).not.toContain('navigate(');
    }
  });

  it('hides the historical pill and keeps the semantic static active surface', () => {
    expect(css).toMatch(/BIG-UPDATE-13:[\s\S]*?\.primaryNavSlidingIndicator\s*\{[\s\S]*?display:\s*none/);
    expect(css).toContain('background: var(--theme-navigation-active-background)');
  });

  it('preserves focus-visible, reduced-motion, and mobile safe-area coverage', () => {
    expect(css).toContain('.navItem:focus-visible');
    expect(css).toContain('.bottomNav__item:focus-visible');
    expect(css).toContain('outline: 3px solid var(--color-focus)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/\.primaryNavSlidingIndicator,[\s\S]*transition: none;/);
    expect(css).toContain('--phase36b-bottom-nav-safe-area');
    expect(css).toContain('bottom: calc(10px + var(--phase36b-bottom-nav-safe-area))');
  });

  it('registers only the Phase 37-uiH validator as the active workflow gate', () => {
    expect(workflow).toContain('Phase 37-uiG validator retained as historical reference');
    expect(workflow).toContain('# node scripts/validate-phase37-uig-study-room-evidence-hybrid-nav-scope.js');
    expect(workflow).toContain('Validate Phase 37-uiH Hybrid Sliding Navigation Indicator Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uih-hybrid-sliding-navigation-indicator-pilot.js');
    expect(workflow).not.toContain('continue-on-error: true');
  });

  it('keeps the validator post-merge-main safe from initial implementation', () => {
    expect(validator).toContain('pr-diff');
    expect(validator).toContain('post-merge-main');
    expect(validator).toContain('validator-hotfix');
    expect(validator).toContain("git(['rev-parse', '--verify', 'origin/main'])");
    expect(validator).not.toContain("git(['fetch'");
  });
});
