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

describe('Phase 35H — route-driven indicator wiring', () => {
  it('uses current location to derive active nav index in both primary nav surfaces', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('useLocation');
      expect(source).toContain('navRoutes.findIndex');
      expect(source).toContain('item.path === location.pathname');
      expect(source).toContain('--nav-active-index');
      expect(source).toContain('--nav-item-count');
    }
  });

  it('adds one visual indicator element to desktop and mobile nav hosts', () => {
    for (const source of [sidebar, bottomNav]) {
      expect(source).toContain('primaryNavIndicatorHost');
      expect(source).toContain('primaryNavSlidingIndicator');
      expect(source).toContain('aria-hidden="true"');
      expect(source).toContain('data-nav-active');
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

describe('Phase 35H — CSS indicator behavior', () => {
  it('uses transform and opacity transitions for the sliding pill', () => {
    expect(css).toContain('.primaryNavSlidingIndicator');
    expect(css).toContain('transform 210ms cubic-bezier(0.2, 0.8, 0.2, 1)');
    expect(css).toContain('opacity 180ms ease');
    expect(css).toContain('translate3d');
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
    expect(css).toMatch(/\.primaryNavSlidingIndicator,[\s\S]*transition: none;/);
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
