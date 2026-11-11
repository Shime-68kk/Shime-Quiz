import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeLaunchIntro from '../../src/launch/ShimeLaunchIntro.jsx';
import { ShimeLanguageProvider } from '../../src/uiI18n/ShimeLanguageProvider.jsx';
import {
  SHIME_LAUNCH_DURATION_MS,
  SHIME_LAUNCH_REDUCED_DURATION_MS,
  createShimeLaunchDocumentState
} from '../../src/launch/launchLifecycle.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const gateSource = read('src/launch/ShimeLaunchGate.jsx');
const introSource = read('src/launch/ShimeLaunchIntro.jsx');
const lifecycleSource = read('src/launch/launchLifecycle.js');
const timelineSource = read('src/launch/launchTimeline.js');
const oledSource = read('src/components/brand/ShimeOledFace.jsx');
const homeSource = read('src/routes/Home.jsx');
const mainSource = read('src/main.jsx');
const css = read('src/styles/global.css');

function renderIntro(locale) {
  return renderToStaticMarkup(
    <ShimeLanguageProvider initialLocale={locale}>
      <ShimeLaunchIntro onComplete={() => {}} />
    </ShimeLanguageProvider>
  );
}

describe('BIG-UPDATE-14 launch document lifecycle', () => {
  it('plays on initial Home, completes once, and naturally replays in a new document', () => {
    const documentState = createShimeLaunchDocumentState('/');
    expect(documentState.shouldShow('/')).toBe(true);
    documentState.complete();
    expect(documentState.shouldShow('/')).toBe(false);
    expect(createShimeLaunchDocumentState('/').shouldShow('/')).toBe(true);
  });

  it('never forces launch for a document opened on a deep route', () => {
    for (const route of ['/library', '/settings', '/study-room', '/dashboard']) {
      const documentState = createShimeLaunchDocumentState(route);
      expect(documentState.shouldShow(route)).toBe(false);
      expect(documentState.shouldShow('/')).toBe(false);
    }
  });

  it('uses in-memory state only with approved durations', () => {
    expect(SHIME_LAUNCH_DURATION_MS).toBe(5150);
    expect(SHIME_LAUNCH_REDUCED_DURATION_MS).toBe(650);
    expect(lifecycleSource).not.toMatch(/localStorage|sessionStorage|indexedDB/);
  });
});

describe('BIG-UPDATE-14 launch presentation and accessibility', () => {
  it('renders a localized label and an immediate real Skip button without premature brand copy', () => {
    const vi = renderIntro('vi');
    const en = renderIntro('en');
    expect(vi).toContain('>Bỏ qua</button>');
    expect(en).toContain('>Skip</button>');
    expect(vi).not.toContain('Chào mừng đến với Shime Quiz.');
    expect(en).not.toContain('Welcome to Shime Quiz.');
  });

  it('keeps the app inert and hidden from accessibility while launch is active', () => {
    expect(gateSource).toContain("aria-hidden={active ? 'true' : undefined}");
    expect(gateSource).toContain('inert={active ? true : undefined}');
    expect(gateSource).toContain("event.key === 'Escape'");
    expect(css).toMatch(/\.shimeLaunchIntro__skip\s*\{[\s\S]*?min-height:\s*44px/);
    expect(css).toContain('.shimeLaunchIntro__skip:focus-visible');
  });

  it('runs one deterministic 5.15-second WAAPI sequence and provides a static reduced-motion path', () => {
    expect(timelineSource).toContain('createShimeLaunchTimeline');
    expect(timelineSource).toContain('element.animate');
    expect(timelineSource).toContain('document.timeline.currentTime');
    expect(css).not.toContain('shimeLaunch141');
    expect(css).toMatch(/prefers-reduced-motion:[\s\S]*?\.shimeLaunchIntro--reduced/);
    expect(gateSource).toContain('prefersReducedShimeLaunch()');
    expect(gateSource).toContain('reducedMotion={reducedMotion}');
  });

  it('stages one persistent rock and a head-only Scene 1 actor', () => {
    const markup = renderIntro('en');
    expect((markup.match(/data-rock-actor="persistent"/g) || [])).toHaveLength(1);
    expect(markup).toContain('data-scene-actor="shime-head"');
    expect(markup).not.toMatch(/shimeLaunchIntro__leg|shimeLaunchIntro__brand|shimeLaunchIntro__fragment/);
    expect(introSource).not.toContain('Math.random');
  });

  it('ships explicit, visibly distinct Scene 1 OLED expression groups', () => {
    for (const expression of ['turboExcited', 'impactShock', 'dazed', 'closed', 'recovering', 'angryRecovery']) {
      expect(oledSource).toContain(`shimeCinematicFace__expression--${expression}`);
      expect(timelineSource).toContain(expression);
    }
    for (const contractName of ['TURBO_EXCITED', 'IMPACT_SHOCK', 'DAZED', 'ANGRY_RECOVERY']) {
      expect(oledSource).toContain(`data-scene-expression="${contractName}"`);
    }
  });

  it('contains no fake loading UI, media, network, timers, or tracking', () => {
    const runtime = `${gateSource}\n${introSource}\n${lifecycleSource}\n${timelineSource}`;
    for (const forbidden of ['progress', 'percentage', '<video', '<canvas', 'fetch(', 'WebSocket', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'pointermove', 'mousemove']) {
      expect(runtime).not.toContain(forbidden);
    }
  });
});

describe('BIG-UPDATE-14 placement boundary', () => {
  it('does not mount the unfinished launch animation (removed for the student deployment)', () => {
    expect(mainSource).not.toContain('ShimeLaunchGate');
  });

  it('removes the duplicate Home greeting runtime', () => {
    expect(homeSource).not.toMatch(/ShimeArrivalGreeting|arrivalSession|arrivalActive|arrivalGreeting|arrivalPrompt/);
    expect(homeSource).toContain('motion="idle"');
  });
});
