/**
 * Phase 37-uiN — Collapsible Avatar Header Pilot
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
const validator = read('scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js');

describe('Phase 37-uiN — collapsible avatar header pilot', () => {
  it('attaches one passive marker to the existing sidebar brand identity surface', () => {
    expect(sidebar).toContain('phase37uin-collapsible-avatar-header-pilot');
    expect(sidebar).toContain('data-phase37uin-collapsible-avatar-header="sidebar-brand-identity"');
    expect(sidebar).toContain('<span className="brandMark" aria-hidden="true"><ShimeBrandMark size="sm" /></span>');
    expect(sidebar).not.toContain('aria-hidden="true">S</span>');
    expect(sidebar).toContain('APP_VERSION_LABEL');
    expect(bottomNav).not.toContain('phase37uin-collapsible-avatar-header-pilot');
  });

  it('preserves route-driven sidebar navigation without new handlers or destinations', () => {
    expect(sidebar).toContain('useLocation');
    expect(sidebar).toContain('navRoutes.findIndex');
    expect(sidebar).toContain('item.path === location.pathname');
    expect(sidebar).toContain('to={item.path}');
    expect(sidebar).not.toContain('onClick=');
    expect(sidebar).not.toContain('navigate(');
  });

  it('adds a scoped cream and moss avatar/header panel treatment with reduced-motion support', () => {
    expect(css).toContain('Phase 37-uiN — Collapsible Avatar Header Pilot');
    expect(css).toContain('.phase37uin-collapsible-avatar-header-pilot');
    expect(css).toContain('--phase37uin-avatar-cream');
    expect(css).toContain('--phase37uin-avatar-moss');
    expect(css).toContain('--phase37uin-avatar-glow');
    expect(css).toContain('.phase37uin-collapsible-avatar-header-pilot .brandMark');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*transition:\s*none;/);
  });

  it('does not introduce account, upload, storage, network, or telemetry behavior', () => {
    const changedRuntime = `${sidebar}\n${css}`;
    expect(changedRuntime).not.toMatch(/localStorage\s*\.\s*setItem|sessionStorage\s*\.\s*setItem/);
    expect(changedRuntime).not.toMatch(/\bfetch\s*\(|navigator\.sendBeacon|XMLHttpRequest/);
    expect(changedRuntime).not.toMatch(/avatarUpload|uploadAvatar|signIn|signOut|account menu|profile backend/i);
  });

  it('registers the Phase 37-uiN validator as the active workflow gate', () => {
    expect(workflow).toContain('Phase 37-uiM validator retained as historical reference; not run as Phase 37-uiN merge-blocking gate.');
    expect(workflow).toContain('# node scripts/validate-phase37-uim-streak-fire-evidence-collapsible-avatar-header-scope.js');
    expect(workflow).toContain('Validate Phase 37-uiN Collapsible Avatar Header Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js');
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
