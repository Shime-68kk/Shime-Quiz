import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

describe('Phase 37-uiD library shelf modern collection cards pilot', () => {
  const library = read('src/routes/Library.jsx');
  const css = read('src/styles/global.css');
  const workflow = read('.github/workflows/e2e-smoke.yml');

  it('adds one passive Library host class without changing tab semantics', () => {
    expect(library).toContain('pageStack phase37uid-library-shelf-modern-collection-cards-pilot');
    expect(library).toContain('role="tablist" className="libraryTabList phase36e-library-tabs-touch-pilot"');
    expect(library.match(/role="tab"/g)).toHaveLength(2);
    expect(library).toContain('Kệ sách của tôi');
    expect(library).toContain('Xưởng nạp tài liệu');
    expect(library).toContain("aria-selected={libraryTab === 'shelf'}");
    expect(library).toContain("aria-selected={libraryTab === 'workshop'}");
    expect(library).toContain('aria-controls="library-panel-shelf"');
    expect(library).toContain('aria-controls="library-panel-workshop"');
  });

  it('keeps shelf and workshop panel mounting plus importStatus placement intact', () => {
    expect(library).toContain('id="library-panel-shelf"');
    expect(library).toContain('id="library-panel-workshop"');
    expect(library).toContain("hidden={libraryTab !== 'shelf'}");
    expect(library).toContain("hidden={libraryTab !== 'workshop'}");
    expect(library).toContain('className="libraryTabPanel"');
    expect(library.indexOf('importStatus ? <Toast')).toBeGreaterThan(
      library.lastIndexOf('id="library-panel-workshop"')
    );
  });

  it('keeps raw input state and import/workshop handlers in Library', () => {
    expect(library).toMatch(/const \[textDraft, setTextDraft\] = useState/);
    expect(library).toMatch(/const \[aiPromptSource, setAiPromptSource\] = useState/);
    expect(library).toMatch(/function openFilePicker\(\)[\s\S]{0,220}setLibraryTab\(['"]workshop['"]\)/);
    expect(library).toMatch(/function openTextFilePicker\(\)[\s\S]{0,220}setLibraryTab\(['"]workshop['"]\)/);
    expect(library).toMatch(/function openDocumentFilePicker\(\)[\s\S]{0,220}setLibraryTab\(['"]workshop['"]\)/);
  });

  it('scopes modern collection-card styling to the Library shelf pilot class', () => {
    expect(css).toContain('Phase 37-uiD');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot');
    expect(css).toContain('--phase37uid-shelf-card');
    expect(css).toContain('--phase37uid-shelf-border');
    expect(css).toContain('--phase37uid-shelf-glow');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot #library-panel-shelf');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot .librarySubjectGrid > .card');
    expect(css).toContain('.phase37uid-library-shelf-modern-collection-cards-pilot .libraryEmptyOnboardingCard');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('does not introduce persistence, a theme picker, or forbidden runtime files', () => {
    const runtime = `${library}\n${css}`;
    expect(runtime).not.toMatch(/localStorage\s*\.\s*setItem|setAttribute\(['"]data-theme|ThemePicker|persisted theme|account-synced/i);
    expect(workflow).toContain('Validate Phase 37-uiD Library Shelf Modern Collection Cards Pilot');
    expect(workflow).toContain('node scripts/validate-phase37-uid-library-shelf-modern-collection-cards-pilot.js');
    expect(workflow).toContain('Phase 37-uiC validator retained as historical reference');
  });
});
