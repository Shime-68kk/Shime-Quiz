import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeLaunchIntro from '../../src/launch/ShimeLaunchIntro.jsx';
import { createShimeLaunchDocumentState } from '../../src/launch/launchLifecycle.js';
import { ShimeLanguageProvider } from '../../src/uiI18n/ShimeLanguageProvider.jsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const introSource = read('src/launch/ShimeLaunchIntro.jsx');
const timelineSource = read('src/launch/launchTimeline.js');
const gateSource = read('src/launch/ShimeLaunchGate.jsx');
const oledSource = read('src/components/brand/ShimeOledFace.jsx');
const packageJson = JSON.parse(read('package.json'));

function renderScene(reducedMotion = false) {
  return renderToStaticMarkup(
    <ShimeLanguageProvider initialLocale="en">
      <ShimeLaunchIntro onComplete={() => {}} reducedMotion={reducedMotion} />
    </ShimeLanguageProvider>
  );
}

describe('BIG-UPDATE-14.3 runtime Scene 1', () => {
  it('renders one rock, one head, impact debris, and electrical daze actors', () => {
    const markup = renderScene();
    expect((markup.match(/data-rock-actor="persistent"/g) || [])).toHaveLength(1);
    expect((markup.match(/data-scene-actor="shime-head"/g) || [])).toHaveLength(1);
    expect((markup.match(/shimeLaunchIntro__stoneChip/g) || [])).toHaveLength(6);
    expect((markup.match(/shimeLaunchIntro__electric shimeLaunchIntro__electric--/g) || [])).toHaveLength(4);
  });

  it('contains every required Scene 1 expression contract', () => {
    for (const expression of ['TURBO_EXCITED', 'IMPACT_SHOCK', 'DAZED', 'ANGRY_RECOVERY']) {
      expect(oledSource).toContain(`data-scene-expression="${expression}"`);
    }
  });

  it('ends before any leg, kick, return, tumble, or title assembly actor', () => {
    const runtime = `${renderScene()}\n${introSource}\n${timelineSource}`;
    expect(runtime).not.toMatch(/LaunchLeg|__leg|__foot|kick|pillar return|__fragments|__brand/);
  });

  it('keeps deterministic cancellation, reduced motion, and replay contracts', () => {
    expect(introSource).toContain('animations.forEach(animation => animation.cancel())');
    expect(gateSource).toContain('reducedMotion={reducedMotion}');
    expect(renderScene(true)).toContain('shimeLaunchIntro--reduced');
    const state = createShimeLaunchDocumentState('/');
    expect(state.shouldShow('/')).toBe(true);
    state.complete();
    expect(state.shouldShow('/')).toBe(false);
  });

  it('adds no animation dependency or frame-loop API', () => {
    for (const dependency of ['framer-motion', 'gsap', 'lottie', 'react-spring', 'three', 'matter-js']) {
      expect(packageJson.dependencies?.[dependency]).toBeUndefined();
      expect(packageJson.devDependencies?.[dependency]).toBeUndefined();
    }
    expect(timelineSource).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|Math\.random/);
  });
});
