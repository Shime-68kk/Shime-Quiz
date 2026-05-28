/**
 * Phase 37-uiP — UI Modernization Coherence Pass Pilot
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

const css = read('src/styles/global.css');
const workflow = read('.github/workflows/e2e-smoke.yml');
const validator = read('scripts/validate-phase37-uip-ui-modernization-coherence-pass-pilot.js');
const dashboard = read('src/routes/Dashboard.jsx');
const library = read('src/routes/Library.jsx');
const studyRoom = read('src/routes/StudyRoom.jsx');
const studyResultSummary = read('src/components/study/StudyResultSummary.jsx');
const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');

describe('Phase 37-uiP — UI modernization coherence pass pilot', () => {
  it('keeps the runtime coherence pass CSS-only over existing Phase 37 surfaces', () => {
    expect(css).toContain('Phase 37-uiP — UI Modernization Coherence Pass Pilot');
    expect(css).toContain('--phase37uip-coherence-paper');
    expect(css).toContain('--phase37uip-coherence-border');
    expect(css).toContain('--phase37uip-coherence-shadow-lg');
    expect(css).toContain('--phase37uip-coherence-motion');
    expect(css).toContain('.phase37uib-dynamic-canvas-token-preview');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot');
    expect(css).toContain('.phase37uih-hybrid-sliding-navigation-indicator-pilot');
    expect(css).toContain('.phase37uil-streak-fire-ignition-micro-moment-pilot');
    expect(css).toContain('.phase37uin-collapsible-avatar-header-pilot');
  });

  it('aligns known modernized runtime markers without adding passive class work', () => {
    expect(dashboard).toContain('phase37uib-dynamic-canvas-token-preview');
    expect(library).toContain('phase37uid-library-shelf-modern-collection-cards-pilot');
    expect(studyRoom).toContain('phase37uif-study-room-modern-answer-surface-pilot');
    expect(studyResultSummary).toContain('phase37uil-streak-fire-ignition-micro-moment-pilot');
    expect(sidebar).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop');
    expect(sidebar).toContain('phase37uin-collapsible-avatar-header-pilot');
    expect(bottomNav).toContain('phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile');
  });

  it('preserves focus-visible and reduced-motion coverage', () => {
    expect(css).toContain('.phase37uib-dynamic-canvas-token-preview .dashboardCalmTab:focus-visible');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot .topicPill:focus-visible');
    expect(css).toContain('.phase37uif-study-room-modern-answer-surface-pilot .choiceOption:focus-within');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/Phase 37-uiP[\s\S]*prefers-reduced-motion:\s*reduce[\s\S]*transition:\s*none;/);
  });

  it('does not introduce theme persistence, route behavior, storage, network, or telemetry behavior', () => {
    const runtime = [css, dashboard, library, studyRoom, studyResultSummary, sidebar, bottomNav].join('\n');
    expect(runtime).not.toMatch(/localStorage\s*\.\s*setItem|sessionStorage\s*\.\s*setItem/);
    expect(runtime).not.toMatch(/setAttribute\(['"]data-theme|ThemePicker|persisted theme|account-synced/i);
    expect(runtime).not.toMatch(/\bfetch\s*\(|navigator\.sendBeacon|XMLHttpRequest/);
  });

  it('registers only the Phase 37-uiP validator as the active workflow gate', () => {
    expect(workflow).toContain('Phase 37-uiO validator retained as historical reference; not run as Phase 37-uiP merge-blocking gate.');
    expect(workflow).toContain('# node scripts/validate-phase37-uio-collapsible-avatar-header-evidence-ui-coherence-scope.js');
    expect(workflow).toContain('Validate Phase 37-uiP UI Modernization Coherence Pass Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uip-ui-modernization-coherence-pass-pilot.js');
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
