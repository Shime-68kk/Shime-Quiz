/**
 * Phase 36H — Core Interactive Focus Visible Consistency Pilot
 *
 * Static source guardrails only. The pilot is intentionally CSS-only and
 * scoped to existing core interactive focus-visible selectors.
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
const validator = read('scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js');

describe('Phase 36H — core interactive focus-visible CSS', () => {
  it('defines a scoped Phase 36H focus-visible token block', () => {
    expect(css).toContain('Phase 36H');
    expect(css).toContain('--phase36h-core-focus-visible-outline');
    expect(css).toContain('--phase36h-core-focus-visible-offset');
    expect(css).toContain('--phase36h-core-focus-visible-shadow');
  });

  it('keeps keyboard focus-visible rings on representative core controls', () => {
    for (const selector of [
      '.button:focus-visible',
      '.navItem:focus-visible',
      '.bottomNav__item:focus-visible',
      '.dashboardCalmTab:focus-visible',
      '.libraryTab:focus-visible',
      '.shortAnswerField input:focus-visible',
      '.studyGoalField select:focus-visible'
    ]) {
      expect(css).toContain(selector);
    }
    expect(css).toContain('outline: var(--phase36h-core-focus-visible-outline)');
    expect(css).toContain('outline-offset: var(--phase36h-core-focus-visible-offset)');
    expect(css).toContain('box-shadow: var(--phase36h-core-focus-visible-shadow)');
  });

  it('preserves reduced-motion handling without adding focus animation', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/\.button:focus-visible,[\s\S]*\.libraryTab:focus-visible[\s\S]*transition: none;/);
    expect(css).not.toMatch(/@keyframes\s+phase36h/i);
  });
});

describe('Phase 36H — validator and workflow registration', () => {
  it('registers only the Phase 36H validator as the active workflow validator', () => {
    expect(workflow).toContain('Phase 36G validator retained as historical reference');
    expect(workflow).toContain('# node scripts/validate-phase36g-mobile-accessibility-track-focus-scope.js');
    expect(workflow).toContain('Validate Phase 36H Core Interactive Focus Visible Consistency Pilot');
    expect(workflow).toContain('node scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js');

    const activeValidatorRuns = workflow
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith('run: node scripts/validate-phase'));
    expect(activeValidatorRuns).toEqual([
      'run: node scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js'
    ]);
  });

  it('keeps the validator post-merge-main safe from initial implementation', () => {
    expect(validator).toContain('pr-diff');
    expect(validator).toContain('post-merge-main');
    expect(validator).toContain('validator-hotfix');
    expect(validator).toContain("git(['rev-parse', '--verify', 'origin/main'])");
    expect(validator).not.toMatch(/git\(\s*\[\s*['"]fetch['"]/);
  });
});
