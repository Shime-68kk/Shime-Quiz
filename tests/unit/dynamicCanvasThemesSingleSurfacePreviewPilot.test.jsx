import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = file => fs.readFileSync(file, 'utf8');

const dashboard = read('src/routes/Dashboard.jsx');
const css = read('src/styles/global.css');
const workflow = read('.github/workflows/e2e-smoke.yml');
const validator = read('scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js');

describe('Phase 37-uiU — dynamic canvas themes single-surface preview pilot', () => {
  it('attaches one passive marker to the existing Dashboard Dynamic Canvas token preview surface', () => {
    expect(dashboard).toContain('phase37uib-dynamic-canvas-token-preview phase37uiu-dynamic-canvas-single-surface-preview-pilot');
    expect(dashboard).toContain('data-phase37uiu-dynamic-canvas-preview="moss-library"');
    expect((dashboard.match(/phase37uiu-dynamic-canvas-single-surface-preview-pilot/g) || [])).toHaveLength(1);
    expect((dashboard.match(/data-phase37uiu-dynamic-canvas-preview/g) || [])).toHaveLength(1);
  });

  it('keeps the preview scoped and non-persistent', () => {
    expect(dashboard).not.toMatch(/localStorage\s*\.\s*setItem|sessionStorage\s*\.\s*setItem|setAttribute\(['"]data-theme|ThemePicker/i);
    expect(css).toContain('.phase37uiu-dynamic-canvas-single-surface-preview-pilot[data-phase37uiu-dynamic-canvas-preview=\'moss-library\']');
    expect(css).toContain('--phase37uiu-moss-library-paper');
    expect(css).toContain('--phase37uiu-moss-library-moss');
    expect(css).toContain('pointer-events: none;');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).not.toMatch(/(?:^|\n)\s*(?:body|html|:root|\#root)\[?[^,{]*data-theme/i);
  });

  it('registers only the Phase 37-uiU validator as the active Phase 37 validator', () => {
    expect(workflow).toContain('Phase 37-uiT validator retained as historical reference');
    expect(workflow).toContain('# node scripts/validate-phase37-uit-dynamic-canvas-themes-single-surface-scope-gate.js');
    expect(workflow).toContain('node scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js');
    expect(validator).toContain('pr-diff');
    expect(validator).toContain('post-merge-main');
    expect(validator).toContain('validator-hotfix');
    expect(validator).not.toMatch(/git\s*\(\s*\[\s*['"]fetch['"]/);
  });
});
