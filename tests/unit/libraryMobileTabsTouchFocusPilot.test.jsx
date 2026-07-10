/**
 * Phase 36E — Library Mobile Tabs Touch and Focus Pilot
 *
 * Static source guardrails only. The pilot is intentionally scoped to the
 * existing Library tab switcher class and CSS.
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

const librarySrc = read('src/routes/Library.jsx');
const css = read('src/styles/global.css');

describe('Phase 36E — Library tab pilot scope', () => {
  it('adds the scoped Phase 36E pilot class to the existing tablist only', () => {
    expect(librarySrc).toContain('role="tablist" className="libraryTabList phase36e-library-tabs-touch-pilot"');
    expect(librarySrc.match(/phase36e-library-tabs-touch-pilot/g)).toHaveLength(1);
  });

  it('preserves tab roles, labels, aria-selected, and aria-controls', () => {
    expect(librarySrc.match(/role="tab"/g)).toHaveLength(2);
    expect(librarySrc).toContain("t('library.shelfTab')");
    expect(librarySrc).toContain("t('library.addTab')");
    expect(librarySrc).toContain("aria-selected={libraryTab === 'shelf'}");
    expect(librarySrc).toContain("aria-selected={libraryTab === 'workshop'}");
    expect(librarySrc).toContain('aria-controls="library-panel-shelf"');
    expect(librarySrc).toContain('aria-controls="library-panel-workshop"');
  });

  it('preserves mounted tab panels with hidden inactive state', () => {
    expect(librarySrc).toContain('id="library-panel-shelf"');
    expect(librarySrc).toContain('id="library-panel-workshop"');
    expect(librarySrc).toContain("hidden={libraryTab !== 'shelf'}");
    expect(librarySrc).toContain("hidden={libraryTab !== 'workshop'}");
  });

  it('keeps raw input state in Library and importStatus outside the panels', () => {
    expect(librarySrc).toMatch(/const \[textDraft, setTextDraft\] = useState/);
    expect(librarySrc).toMatch(/const \[aiPromptSource, setAiPromptSource\] = useState/);
    expect(librarySrc.indexOf('importStatus ? <Toast')).toBeGreaterThan(
      librarySrc.lastIndexOf('id="library-panel-workshop"')
    );
  });
});

describe('Phase 36E — Library mobile touch and focus CSS', () => {
  it('scopes touch comfort rules to the Library tab pilot class', () => {
    expect(css).toContain('Phase 36E');
    expect(css).toContain('.phase36e-library-tabs-touch-pilot .libraryTab');
    expect(css).toContain('min-height: 48px');
    expect(css).toContain('min-width: 44px');
    expect(css).toContain('touch-action: manipulation');
  });

  it('keeps focus-visible clarity scoped to the pilot tabs', () => {
    expect(css).toContain('.phase36e-library-tabs-touch-pilot .libraryTab:focus-visible');
    expect(css).toContain('outline: 3px solid var(--color-focus, #2563eb)');
    expect(css).toContain('outline-offset: 3px');
  });

  it('contains 375px-safe wrapping and reduced-motion handling', () => {
    expect(css).toContain('@media (max-width: 560px)');
    expect(css).toContain('flex: 1 1 min(10rem, 100%)');
    expect(css).toContain('overflow-wrap: anywhere');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.phase36e-library-tabs-touch-pilot .libraryTab');
    expect(css).toContain('transition: none');
  });
});
