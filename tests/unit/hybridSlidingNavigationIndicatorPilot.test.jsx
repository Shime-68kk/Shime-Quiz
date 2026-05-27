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

describe('Phase 37-uiH — hybrid sliding navigation indicator pilot', () => {
  it('adds passive Phase 37-uiH host markers to desktop and mobile nav only', () => {
    expect(sidebar).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop');
    expect(bottomNav).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile');
    expect(sidebar).toContain('primaryNavSlidingIndicator');
    expect(bottomNav).toContain('primaryNavSlidingIndicator');
  });

  it('derives visual active index from current location without changing links or handlers', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('useLocation');
      expect(source).toContain('navRoutes.findIndex');
      expect(source).toContain('item.path === location.pathname');
      expect(source).toContain('--phase37uih-active-index');
      expect(source).toContain('to={item.path}');
      expect(source).not.toContain('onClick=');
      expect(source).not.toContain('navigate(');
    }
  });

  it('scopes cream and moss sliding-pill treatment with vertical and horizontal transforms', () => {
    expect(css).toContain('.phase37uih-hybrid-sliding-navigation-indicator-pilot');
    expect(css).toContain('--phase37uih-nav-cream');
    expect(css).toContain('--phase37uih-nav-moss');
    expect(css).toContain('--phase37uih-nav-shadow');
    expect(css).toContain('calc(var(--phase37uih-active-index, var(--nav-active-index, 0)) * var(--nav-item-step, 58px))');
    expect(css).toContain('calc(var(--phase37uih-active-index, var(--nav-active-index, 0)) * (100% + var(--nav-item-gap, 0px)))');
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
