import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = file => fs.readFileSync(path.resolve(ROOT, file), 'utf8');

describe('route-level performance boundary', () => {
  const routeConfig = read('src/routes/routeConfig.js');
  const main = read('src/main.jsx');
  const app = read('src/App.jsx');
  const sidebar = read('src/layout/Sidebar.jsx');
  const bottomNav = read('src/layout/BottomNav.jsx');
  const loadingCss = read('src/styles/route-loading.css');
  const settings = read('src/routes/Settings.jsx');
  const settingsDisclosure = read('src/components/settings/SettingsDisclosure.jsx');

  it('keeps every page module out of eager startup imports', () => {
    for (const page of ['Dashboard', 'Library', 'StudyRoom', 'Settings', 'FsrsUiFixture']) {
      expect(routeConfig).not.toMatch(new RegExp(`import\\s+${page}\\s+from`));
      expect(routeConfig).toContain(`import('./${page}.jsx')`);
      expect(routeConfig).toContain(`lazy(load${page})`);
    }
    expect(main).not.toMatch(/import\s+Home\s+from/);
    expect(main).toContain("React.lazy(() => import('./routes/Home.jsx'))");
  });

  it('reuses route loaders for intent-based preloading', () => {
    expect(routeConfig).toContain('preload: loadDashboard');
    expect(routeConfig).toContain('preload: loadLibrary');
    expect(routeConfig).toContain('preload: loadStudyRoom');
    expect(routeConfig).toContain('preload: loadSettings');
    expect(routeConfig).toContain('export function preloadRoute(pathname)');
    for (const navigation of [sidebar, bottomNav]) {
      expect(navigation).toContain('onPointerEnter={() => preloadRoute(item.path)}');
      expect(navigation).toContain('onFocus={() => preloadRoute(item.path)}');
    }
  });

  it('provides an accessible, reduced-motion-safe loading state', () => {
    expect(app).toContain('<Suspense fallback={<RouteLoadingFallback />}>');
    expect(app).toContain('role="status"');
    expect(app).toContain('aria-live="polite"');
    expect(loadingCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('defers advanced and developer settings until the learner opens them', () => {
    expect(settings).toContain("const FsrsExperimentalSettingsPanel = lazy(() => import(");
    expect(settings).toContain("const CompanionDevPanel = lazy(() => import(");
    expect(settings).toContain('<Suspense fallback={<SettingsPanelLoading');
    expect(settingsDisclosure).toContain('{hasOpened ? children : null}');
  });
});
