/**
 * Phase 35H — Hybrid Sliding Navigation Indicator
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
const routes = read('src/routes/routeConfig.js');

describe('BIG-UPDATE-13 — deterministic route-driven navigation state', () => {
  it('delegates active route state to NavLink in both primary nav surfaces', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('NavLink');
      expect(source).toContain('to={item.path}');
      expect(source).toMatch(/className=\{\(\{ isActive \}\) =>/);
    }
  });

  it('removes the moving visual indicator element from desktop and mobile hosts', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('primaryNavIndicatorHost');
      expect(source).not.toContain('primaryNavSlidingIndicator');
      expect(source).not.toContain('--nav-active-index');
      expect(source).not.toContain('--phase37uih-active-index');
    }
  });

  it('preserves NavLink destinations and existing active class callbacks', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('to={item.path}');
      expect(source).toMatch(/className=\{\(\{ isActive \}\) =>/);
      expect(source).not.toContain('onClick=');
      expect(source).not.toContain('navigate(');
    }
  });
});

describe('BIG-UPDATE-13 — CSS active-state behavior', () => {
  it('disables the legacy moving pill and uses one static active surface', () => {
    expect(css).toContain('.primaryNavSlidingIndicator');
    expect(css).toMatch(/BIG-UPDATE-13:[\s\S]*?\.primaryNavSlidingIndicator\s*\{[\s\S]*?display:\s*none/);
    expect(css).toMatch(/BIG-UPDATE-13:[\s\S]*?\.navItem--active,[\s\S]*?background:\s*var\(--theme-navigation-active-background\)/);
    expect(css).toMatch(/\.navItem--active::after\s*\{\s*content:\s*none/);
  });

  it('preserves focus-visible styling for nav items', () => {
    expect(css).toMatch(/\.navItem:focus-visible/);
    expect(css).toMatch(/\.bottomNav__item:focus-visible/);
    expect(css).toContain('outline: 3px solid var(--color-focus)');
  });

  it('includes responsive mobile and reduced-motion coverage', () => {
    expect(css).toContain('@media (max-width: 860px)');
    expect(css).toContain('@media (max-width: 380px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/\.primaryNavSlidingIndicator\s*\{[\s\S]*?transition:\s*none/);
  });
});

describe('Phase 35H — route and system scope guard', () => {
  it('keeps the existing four visible nav route labels and paths', () => {
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

  it('does not introduce storage, sync, telemetry, auth, or backend behavior in nav files', () => {
    const runtime = `${sidebar}\n${bottomNav}`;
    for (const forbidden of ['localStorage', 'indexedDB', 'sendBeacon', 'fetch(', 'auth', 'backend', 'telemetry']) {
      expect(runtime).not.toContain(forbidden);
    }
  });
});
