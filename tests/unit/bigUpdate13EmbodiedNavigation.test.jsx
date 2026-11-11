import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ShimeRobotPresence from '../../src/components/brand/ShimeRobotPresence.jsx';
import Sidebar from '../../src/layout/Sidebar.jsx';
import BottomNav from '../../src/layout/BottomNav.jsx';
import { ShimeLanguageProvider } from '../../src/uiI18n/ShimeLanguageProvider.jsx';
import { translateUi } from '../../src/uiI18n/localeRuntime.js';
import {
  createInternalRouteHistory,
  isReturnableInternalPath,
  recordInternalRoute
} from '../../src/navigation/internalRouteHistory.js';
import {
  createShimeLaunchDocumentState
} from '../../src/launch/launchLifecycle.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const css = read('src/styles/global.css');
const tokens = read('src/design-system/tokens.css');

function renderNav(Component, pathname, locale = 'vi') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <ShimeLanguageProvider initialLocale={locale}>
        <Component />
      </ShimeLanguageProvider>
    </MemoryRouter>
  );
}

describe('BIG-UPDATE-13 semantic radius and nested surfaces', () => {
  it('defines an ordered semantic radius hierarchy', () => {
    expect(tokens).toContain('--radius-shell: var(--radius-2xl)');
    expect(tokens).toContain('--radius-panel: var(--radius-xl)');
    expect(tokens).toContain('--radius-card: var(--radius-lg)');
    expect(tokens).toContain('--radius-control: var(--radius-md)');
    expect(tokens).toContain('--radius-small: var(--radius-sm)');
  });

  it('rounds the confirmed Library and Settings inner surfaces without clipping focusable groups', () => {
    expect(css).toMatch(/\.subjectDetailHeader\s*\{[\s\S]*?border-radius:\s*var\(--radius-panel\)/);
    expect(css).toMatch(/\.settingsPanel__warningBlock\s*\{[\s\S]*?border-radius:\s*var\(--radius-control\)/);
    expect(css).toMatch(/\.settingsGroup\s*\{[\s\S]*?overflow:\s*visible/);
    expect(css).toMatch(/#library-panel-shelf\s*\{[\s\S]*?overflow:\s*visible/);
  });
});

describe('BIG-UPDATE-13 route motion and active navigation', () => {
  it('keeps one keyed top-level route stage with no exit or timer choreography', () => {
    const layout = read('src/layout/AppLayout.jsx');
    expect(layout).toContain('className="routeStage"');
    expect(layout).toContain('key={location.pathname}');
    expect(layout.match(/className="routeStage"/g)).toHaveLength(1);
    expect(layout).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|startViewTransition|AnimatePresence/);
    expect(css).toMatch(/\.routeStage\s*\{\s*animation:\s*bu12-route-enter 160ms/);
    expect(css).toMatch(/BIG-UPDATE-13:[\s\S]*?\.libraryTabPanel:not\(\[hidden\]\)[\s\S]*?animation:\s*none/);
  });

  it('renders exactly one active Sidebar and BottomNav destination, including nested Library paths', () => {
    for (const pathname of ['/dashboard', '/library', '/library/material/demo', '/settings']) {
      expect(renderNav(Sidebar, pathname).match(/navItem--active/g) || []).toHaveLength(1);
      expect(renderNav(BottomNav, pathname).match(/bottomNav__item--active/g) || []).toHaveLength(1);
    }
    expect(read('src/layout/Sidebar.jsx')).not.toContain('primaryNavSlidingIndicator');
    expect(read('src/layout/BottomNav.jsx')).not.toContain('primaryNavSlidingIndicator');
  });
});

describe('BIG-UPDATE-13 internal Back history', () => {
  it('hides Back for direct Home, duplicates, and invalid external-like paths', () => {
    const direct = createInternalRouteHistory('/');
    expect(direct.previousInternalPath).toBeNull();
    expect(recordInternalRoute(direct, '/')).toBe(direct);
    expect(isReturnableInternalPath('https://example.com/library')).toBe(false);
  });

  it('records Library and Settings as valid immediate origins for Home', () => {
    for (const origin of ['/library', '/settings']) {
      const history = recordInternalRoute(createInternalRouteHistory(origin), '/');
      expect(history.previousInternalPath).toBe(origin);
    }
    expect(read('src/navigation/useInternalBackNavigation.js')).toContain('navigate(-1)');
    expect(read('src/components/navigation/ContextualBackControl.jsx')).toContain("t('home.back')");
  });

  it('does not create a Home Back origin for browser POP or route replacement', () => {
    for (const navigationType of ['POP', 'REPLACE']) {
      const history = recordInternalRoute(createInternalRouteHistory('/library'), '/', navigationType);
      expect(history.previousInternalPath).toBeNull();
    }
    expect(read('src/navigation/InternalRouteHistoryProvider.jsx')).toContain('useNavigationType');
  });
});

describe('BIG-UPDATE-13 robot arrival and intent-led Home', () => {
  it('plays the approved launch once per Home document and uses no replay storage', () => {
    const firstDocument = createShimeLaunchDocumentState('/');
    expect(firstDocument.shouldShow('/')).toBe(true);
    firstDocument.complete();
    expect(firstDocument.shouldShow('/')).toBe(false);
    expect(createShimeLaunchDocumentState('/').shouldShow('/')).toBe(true);
    expect(createShimeLaunchDocumentState('/library').shouldShow('/')).toBe(false);
    expect(read('src/launch/launchLifecycle.js')).not.toMatch(/sessionStorage|localStorage/);
  });

  it('keeps arrival acting in the dedicated timeline and honors the Scene 1 stop boundary', () => {
    const intro = read('src/launch/ShimeLaunchIntro.jsx');
    const timeline = read('src/launch/launchTimeline.js');
    expect(intro).toContain('ShimeRobotHead');
    expect(intro).toContain('createShimeLaunchTimeline');
    expect(timeline).toContain('angryRecovery');
    expect(intro).not.toMatch(/LaunchLeg|shimeLaunchIntro__brand|shimeLaunchIntro__fragment/);
    expect(timeline).not.toMatch(/side:\s*\[|delight:\s*\[/);
  });

  it('provides localized greeting and intent copy', () => {
    expect(translateUi('home.arrivalGreeting', 'vi')).toBe('Chào mừng bạn đến với Shime.');
    expect(translateUi('home.arrivalGreeting', 'en')).toBe('Welcome to Shime.');
    expect(translateUi('home.intentQuestion', 'vi')).toBe('Bạn muốn làm gì lúc này?');
    expect(translateUi('home.intentQuestion', 'en')).toBe('What would you like to do?');
  });

  it('keeps Home presentation-only while using approved destinations', () => {
    const home = read('src/routes/Home.jsx');
    expect(home).toContain("navigate('/dashboard')");
    expect(home).toContain("navigate('/library')");
    expect(home).toContain("navigate('/study-room'");
    expect(home).toContain("mode: 'smart-practice'");
    for (const forbidden of ['learningData', 'reviewSchedule', 'scheduler', 'deviceBridge', 'companionBridge', 'fetch(', 'WebSocket', 'navigator.serial', 'navigator.bluetooth']) {
      expect(home).not.toContain(forbidden);
    }
  });
});
