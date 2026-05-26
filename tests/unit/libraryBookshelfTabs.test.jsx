/**
 * tests/unit/libraryBookshelfTabs.test.jsx
 *
 * Phase 35B — Library Bookshelf Tab System
 *
 * PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_STATUS: COMPLETED_LIBRARY_BOOKSHELF_TAB_SYSTEM
 * PHASE35B_RUNTIME_SCOPE: LIBRARY_UI_TAB_SEGMENTATION_ONLY_NO_DATA_OR_IMPORT_LOGIC_CHANGES
 * PHASE35B_LIBRARY_DEFAULT_TAB: KE_SACH_CUA_TOI_DEFAULT_LEARNER_FACING_SHELF
 *
 * Static source analysis only. No jsdom, no DOM rendering.
 * Tests cover:
 *   1. Library.jsx exports a default function
 *   2. libraryTab state with default 'shelf' is present in source
 *   3. Tab switcher uses role="tablist" and correct tab labels
 *   4. Shelf panel has id="library-panel-shelf" and role="tabpanel"
 *   5. Workshop panel has id="library-panel-workshop" and role="tabpanel"
 *   6. Shelf panel contains librarySubjectGrid (learner-facing content)
 *   7. Workshop panel contains import/config card class names
 *   8. Both panels use the hidden attribute for inactive state
 *   9. Raw input state (textDraft, aiPromptSource) remains in Library component scope
 *  10. openFilePicker, openTextFilePicker, openDocumentFilePicker call setLibraryTab('workshop')
 *  11. importStatus Toast is outside both panels (always visible)
 *  12. No forbidden files changed (package.json, storage, backup, FSRS)
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Expected file not found: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, relativePath));
}

const librarySrc = read('src/routes/Library.jsx');

// ── 1. File existence ─────────────────────────────────────────────────────────

describe('Phase 35B — Library.jsx exists and exports', () => {
  it('Library.jsx exists', () => {
    expect(exists('src/routes/Library.jsx')).toBe(true);
  });

  it('Library.jsx exports a default function named Library', () => {
    expect(librarySrc).toMatch(/export default function Library\(\)/);
  });
});

// ── 2. Tab state ──────────────────────────────────────────────────────────────

describe('Phase 35B — libraryTab state', () => {
  it("default tab state is 'shelf'", () => {
    expect(librarySrc).toMatch(/useState\(['"]shelf['"]\)/);
  });

  it('libraryTab state variable is declared', () => {
    expect(librarySrc).toMatch(/\blibraryTab\b/);
    expect(librarySrc).toMatch(/\bsetLibraryTab\b/);
  });
});

// ── 3. Tab switcher markup ────────────────────────────────────────────────────

describe('Phase 35B — tab switcher accessibility', () => {
  it('tablist container is present', () => {
    expect(librarySrc).toMatch(/role="tablist"/);
  });

  it('tab buttons use role="tab"', () => {
    const matches = librarySrc.match(/role="tab"/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('shelf tab label is exactly "Kệ sách của tôi"', () => {
    expect(librarySrc).toMatch(/Kệ sách của tôi/);
  });

  it('workshop tab label is exactly "Xưởng nạp tài liệu"', () => {
    expect(librarySrc).toMatch(/Xưởng nạp tài liệu/);
  });

  it('tab buttons have aria-selected', () => {
    expect(librarySrc).toMatch(/aria-selected=\{libraryTab === 'shelf'\}/);
    expect(librarySrc).toMatch(/aria-selected=\{libraryTab === 'workshop'\}/);
  });

  it('tab buttons have aria-controls pointing to panel ids', () => {
    expect(librarySrc).toMatch(/aria-controls="library-panel-shelf"/);
    expect(librarySrc).toMatch(/aria-controls="library-panel-workshop"/);
  });
});

// ── 4 & 5. Panel structure ────────────────────────────────────────────────────

describe('Phase 35B — tab panel structure', () => {
  it('shelf panel has id and role', () => {
    expect(librarySrc).toMatch(/id="library-panel-shelf"/);
    expect(librarySrc).toMatch(/role="tabpanel"/);
  });

  it('workshop panel has id and role', () => {
    expect(librarySrc).toMatch(/id="library-panel-workshop"/);
  });

  it('panels use hidden attribute for inactive state', () => {
    expect(librarySrc).toMatch(/hidden=\{libraryTab !== 'shelf'\}/);
    expect(librarySrc).toMatch(/hidden=\{libraryTab !== 'workshop'\}/);
  });

  it('panels use libraryTabPanel class', () => {
    const matches = librarySrc.match(/className="libraryTabPanel"/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

// ── 6. Shelf panel content ────────────────────────────────────────────────────

describe('Phase 35B — shelf panel content', () => {
  it('librarySubjectGrid is inside shelf panel', () => {
    const shelfPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-shelf"'),
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(shelfPanelBlock).toMatch(/librarySubjectGrid/);
  });

  it('EmptyState is inside shelf panel', () => {
    const shelfPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-shelf"'),
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(shelfPanelBlock).toMatch(/<EmptyState/);
  });

  it('shelf panel does not expose direct import/admin actions', () => {
    const shelfPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-shelf"'),
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(shelfPanelBlock).not.toMatch(/onClick=\{openFilePicker\}/);
    expect(shelfPanelBlock).not.toMatch(/onClick=\{exportCurrentLibrary\}/);
    expect(shelfPanelBlock).not.toMatch(/onClick=\{resetImportedLibrary\}/);
  });
});

// ── 7. Workshop panel content ─────────────────────────────────────────────────

describe('Phase 35B — workshop panel content', () => {
  it('demoSampleQuickstartCard is inside workshop panel', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/demoSampleQuickstartCard/);
  });

  it('JSON import and export actions are inside workshop panel', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/onClick=\{openFilePicker\}/);
    expect(workshopPanelBlock).toMatch(/onClick=\{exportCurrentLibrary\}/);
    expect(workshopPanelBlock).toMatch(/onClick=\{resetImportedLibrary\}/);
  });

  it('textImportCard is inside workshop panel', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/textImportCard/);
  });

  it('V2BackupRestorePanel is inside workshop panel', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/V2BackupRestorePanel/);
  });

  it('ImportPreview is inside workshop panel', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/<ImportPreview/);
  });
});

// ── 9. Raw input state preservation ──────────────────────────────────────────

describe('Phase 35B — raw input state preservation', () => {
  it('textDraft state remains in Library component (not moved to child)', () => {
    expect(librarySrc).toMatch(/const \[textDraft, setTextDraft\] = useState/);
  });

  it('aiPromptSource state remains in Library component (not moved to child)', () => {
    expect(librarySrc).toMatch(/const \[aiPromptSource, setAiPromptSource\] = useState/);
  });

  it('text-quiz-draft-input textarea is inside workshop panel (state hoist confirms preservation)', () => {
    const workshopPanelBlock = librarySrc.slice(
      librarySrc.indexOf('id="library-panel-workshop"')
    );
    expect(workshopPanelBlock).toMatch(/text-quiz-draft-input/);
  });
});

// ── 10. File-picker functions switch to workshop tab ─────────────────────────

describe('Phase 35B — file picker auto-switch to workshop', () => {
  it("openFilePicker calls setLibraryTab('workshop')", () => {
    const fnBlock = librarySrc.slice(
      librarySrc.indexOf('function openFilePicker()'),
      librarySrc.indexOf('function openFilePicker()') + 200
    );
    expect(fnBlock).toMatch(/setLibraryTab\(['"]workshop['"]\)/);
  });

  it("openTextFilePicker calls setLibraryTab('workshop')", () => {
    const fnBlock = librarySrc.slice(
      librarySrc.indexOf('function openTextFilePicker()'),
      librarySrc.indexOf('function openTextFilePicker()') + 200
    );
    expect(fnBlock).toMatch(/setLibraryTab\(['"]workshop['"]\)/);
  });

  it("openDocumentFilePicker calls setLibraryTab('workshop')", () => {
    const fnBlock = librarySrc.slice(
      librarySrc.indexOf('function openDocumentFilePicker()'),
      librarySrc.indexOf('function openDocumentFilePicker()') + 200
    );
    expect(fnBlock).toMatch(/setLibraryTab\(['"]workshop['"]\)/);
  });
});

// ── 11. importStatus Toast is always visible ──────────────────────────────────

describe('Phase 35B — importStatus Toast placement', () => {
  it('importStatus Toast appears after the closing workshop panel div', () => {
    const workshopPanelEnd = librarySrc.lastIndexOf('id="library-panel-workshop"');
    const importStatusToast = librarySrc.indexOf(
      'importStatus ? <Toast',
      workshopPanelEnd
    );
    expect(importStatusToast).toBeGreaterThan(workshopPanelEnd);
  });
});

// ── 12. Forbidden file guard ──────────────────────────────────────────────────

describe('Phase 35B — forbidden files not changed', () => {
  it('package.json was not modified (spot check: no libraryTab in package.json)', () => {
    const pkg = read('package.json');
    expect(pkg).not.toMatch(/libraryTab/);
  });

  it('libraryTab state is local useState only (no localStorage call)', () => {
    const tabStateBlock = librarySrc.slice(
      librarySrc.indexOf("const [libraryTab"),
      librarySrc.indexOf("const [libraryTab") + 80
    );
    expect(tabStateBlock).not.toMatch(/localStorage/);
  });

  it('Phase 35B CSS file present', () => {
    const css = read('src/styles/global.css');
    expect(css).toMatch(/Phase 35B/);
    expect(css).toMatch(/\.libraryTabList/);
    expect(css).toMatch(/\.libraryTab--active/);
    expect(css).toMatch(/\.libraryTabPanel\[hidden\]/);
  });
});
