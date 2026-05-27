/**
 * Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot
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
const button = read('src/components/Button.jsx');
const workflow = read('.github/workflows/e2e-smoke.yml');
const validator = read('scripts/validate-phase37-uij-premium-elastic-tap-compression-token-pilot.js');

describe('Phase 37-uiJ — premium elastic tap compression token pilot', () => {
  it('keeps the runtime pilot CSS-only with Phase 37-uiJ tactile tokens', () => {
    expect(css).toContain('Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot');
    expect(css).toContain('--phase37uij-elastic-tap-press-transform: translateY(1px) scale(0.985)');
    expect(css).toContain('--phase37uij-elastic-tap-shadow');
    expect(css).toContain('--phase37uij-elastic-tap-restoration');
    expect(css).toContain('.button, .navItem, .bottomNav__item, .libraryTab, .dashboardCalmTab, .choiceOption');
  });

  it('compresses bounded enabled action surfaces and excludes disabled or busy buttons', () => {
    expect(css).toContain(".button:not(:disabled):not([aria-disabled='true']):not([aria-busy='true'])");
    expect(css).toContain(".libraryTab:not(:disabled):not([aria-disabled='true'])");
    expect(css).toContain(".dashboardCalmTab:not(:disabled):not([aria-disabled='true'])");
    expect(css).toContain(".choiceOption:not([aria-disabled='true'])");
    expect(css).toMatch(/:active\s*\{[\s\S]*box-shadow:\s*var\(--phase37uij-elastic-tap-shadow\);[\s\S]*transform:\s*var\(--phase37uij-elastic-tap-press-transform\);/);
  });

  it('preserves focus-visible and provides reduced-motion feedback without transform scale', () => {
    expect(css).toContain('.button:focus-visible');
    expect(css).toContain('.navItem:focus-visible');
    expect(css).toContain('.bottomNav__item:focus-visible');
    expect(css).toContain(':focus-visible:active');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*:active\s*\{[\s\S]*opacity:\s*var\(--phase37uij-elastic-tap-reduced-opacity\);[\s\S]*transform:\s*none;/);
  });

  it('does not change the shared Button handler, type, disabled, or busy behavior', () => {
    expect(button).toContain('type = \'button\'');
    expect(button).toContain('disabled={disabled || loading}');
    expect(button).toContain('aria-busy={loading || undefined}');
    expect(button).not.toContain('onPointerDown');
    expect(button).not.toContain('onMouseDown');
    expect(button).not.toContain('onTouchStart');
  });

  it('registers only the Phase 37-uiJ validator as the active workflow gate', () => {
    expect(workflow).toContain('Phase 37-uiI validator retained as historical reference');
    expect(workflow).toContain('# node scripts/validate-phase37-uii-hybrid-nav-evidence-elastic-tap-scope.js');
    expect(workflow).toContain('Validate Phase 37-uiJ Premium Elastic Tap Compression Token Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uij-premium-elastic-tap-compression-token-pilot.js');
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
