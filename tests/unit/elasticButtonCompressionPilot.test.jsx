import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected file not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

describe('Phase 35K elastic button compression pilot', () => {
  const css = read('src/styles/global.css');
  const workflow = read('.github/workflows/e2e-smoke.yml');
  const pilotCssStart = css.indexOf('.pageHeader__actions .button--primary');
  const pilotCssEnd = css.indexOf('.button__spinner', pilotCssStart);
  const pilotCss = css.slice(pilotCssStart, pilotCssEnd);

  it('keeps the pilot scoped to the selected Dashboard and Library surfaces', () => {
    expect(css).toContain('.pageHeader__actions .button--primary');
    expect(css).toContain('.libraryWorkshopActionsCard .textImportActions .button--secondary');
    expect(css).toContain('.demoSampleQuickstartCard .textImportActions .button--secondary');
    expect(css).toContain('--elastic-button-compression-scale: 0.975');
  });

  it('uses active compression without changing pointer routing or disabled behavior', () => {
    expect(css).toContain(':active:not(:disabled):not([aria-busy=\'true\'])');
    expect(css).toContain('transform: scale(var(--elastic-button-compression-scale))');
    expect(css).toContain('box-shadow: var(--elastic-button-compression-shadow)');
    expect(pilotCss).not.toContain('pointer-events: none');
  });

  it('preserves focus-visible styling and reduced-motion fallback', () => {
    expect(css).toContain('.button:focus-visible');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('transform: none');
    expect(css).toContain('opacity: 0.88');
  });

  it('registers only the Phase 35K validator as the active phase gate', () => {
    expect(workflow).toContain('Validate Phase 35K Elastic Button Compression Pilot');
    expect(workflow).toContain('node scripts/validate-phase35k-elastic-button-compression-pilot.js');
    expect(workflow).toContain('Phase 35J validator retained as historical reference');
    expect(workflow).not.toContain('Validate Phase 35J Next UI Polish Scope');
  });
});
