import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

describe('Phase 37-uiB dynamic canvas theme token preview pilot', () => {
  const dashboard = read('src/routes/Dashboard.jsx');
  const css = read('src/styles/global.css');
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('adds one passive Dashboard host class for the selected surface', () => {
    expect(dashboard).toContain('pageStack phase37uib-dynamic-canvas-token-preview');
    expect(dashboard).not.toMatch(/localStorage|setAttribute\(['"]data-theme|setTheme|toggleTheme/);
  });

  it('keeps the token preview CSS scoped to the Dashboard pilot class', () => {
    expect(css).toContain('Phase 37-uiB');
    expect(css).toContain('.phase37uib-dynamic-canvas-token-preview');
    expect(css).toContain('--phase37uib-canvas-wash');
    expect(css).toContain('--phase37uib-panel-bg');
    expect(css).toContain('.phase37uib-dynamic-canvas-token-preview .dashboardCalmTab:focus-visible');
    expect(css).toContain('@media (max-width: 560px)');
  });

  it('does not introduce theme persistence, a picker, or a global theme system', () => {
    const changedRuntime = `${dashboard}\n${css}`;
    expect(changedRuntime).not.toMatch(/localStorage\s*\.\s*setItem|localStorage\s*\[\s*['"]theme['"]\s*\]/);
    expect(changedRuntime).not.toMatch(/data-theme|theme picker|ThemePicker|persisted theme|account-synced/i);
  });

  it('registers only the active Phase 37-uiB validator in the e2e smoke workflow', () => {
    expect(workflow).toContain('Validate Phase 37-uiB Dynamic Canvas Theme Token Preview Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uib-dynamic-canvas-theme-token-preview-pilot.js');
    expect(workflow).toContain('actions/checkout@v4');
    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).not.toContain('git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  });
});
