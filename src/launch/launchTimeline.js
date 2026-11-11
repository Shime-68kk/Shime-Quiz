import { SHIME_LAUNCH_DURATION_MS, SHIME_LAUNCH_REDUCED_DURATION_MS } from './launchLifecycle.js';

const pct = (milliseconds, duration) => milliseconds / duration;

export function createShimeLaunchTimeline(root, { reducedMotion = false } = {}) {
  const animations = [];
  const duration = reducedMotion ? SHIME_LAUNCH_REDUCED_DURATION_MS : SHIME_LAUNCH_DURATION_MS;
  const robot = root.querySelector('.shimeLaunchIntro__robot');
  const rock = root.querySelector('.shimeLaunchIntro__rock');
  const robotRect = robot.getBoundingClientRect();
  const rockRect = rock.getBoundingClientRect();
  const viewportWidth = root.clientWidth;
  const floorY = rockRect.bottom;
  const landingX = viewportWidth * (viewportWidth <= 620 ? .17 : .43);
  const landingY = floorY - robotRect.height + 3;
  const contactX = rockRect.left - robotRect.width + 7;
  const contactY = rockRect.top + rockRect.height * .43 - robotRect.height * .5;
  const startX = -robotRect.width - 48;
  const startY = landingY - (viewportWidth <= 620 ? 6 : 18);
  const apexX = viewportWidth * .39 - robotRect.width * .5;
  const apexY = landingY - (viewportWidth <= 620 ? 126 : 190);
  const reboundApexX = landingX + (contactX - landingX) * .42;
  const reboundApexY = landingY - (viewportWidth <= 620 ? 94 : 138);
  const contactPointX = rockRect.left + 4;
  const contactPointY = contactY + robotRect.height * .48;
  const tx = (x, y, tail = '') => `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)${tail ? ` ${tail}` : ''}`;

  function run(selector, frames, options = {}) {
    const elements = selector === '.shimeLaunchIntro' ? [root] : root.querySelectorAll(selector);
    elements.forEach(element => {
      animations.push(element.animate(frames, {
        duration,
        fill: 'both',
        easing: options.easing || 'linear'
      }));
    });
  }

  if (reducedMotion) {
    const staticX = Math.max(24, rockRect.left - robotRect.width - 44);
    const staticY = landingY;
    run('.shimeLaunchIntro', [
      { offset: 0, opacity: 1 },
      { offset: pct(120, duration), opacity: 1 },
      { offset: pct(500, duration), opacity: 1 },
      { offset: 1, opacity: 0 }
    ]);
    run('.shimeLaunchIntro__robot', [
      { offset: 0, opacity: 0, transform: tx(staticX, staticY, 'rotateZ(-2deg)') },
      { offset: pct(120, duration), opacity: 1, transform: tx(staticX, staticY, 'rotateZ(-2deg)') },
      { offset: 1, opacity: 1, transform: tx(staticX, staticY, 'rotateZ(-2deg)') }
    ]);
    run('.shimeCinematicFace__expression--recovering', [
      { offset: 0, opacity: 1 },
      { offset: 1, opacity: 1 }
    ]);
    run('.shimeLaunchIntro__robotShadow', [
      { offset: 0, opacity: 0, transform: tx(staticX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.72)') },
      { offset: pct(120, duration), opacity: .48, transform: tx(staticX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.72)') },
      { offset: 1, opacity: .48, transform: tx(staticX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.72)') }
    ]);
  } else {
    run('.shimeLaunchIntro', [
      { offset: 0, opacity: 1, transform: 'scale(1.006)' },
      { offset: pct(160, duration), opacity: 1, transform: 'scale(1)' },
      { offset: pct(5000, duration), opacity: 1, transform: 'scale(1)' },
      { offset: 1, opacity: 0, transform: 'scale(.998)' }
    ]);

    run('.shimeLaunchIntro__robot', [
      { offset: 0, opacity: 0, transform: tx(startX - 36, startY + 14, 'rotateZ(-9deg) scale(.92)') },
      { offset: pct(350, duration), opacity: 0, transform: tx(startX - 18, startY + 10, 'rotateZ(-10deg) scale(.94)') },
      { offset: pct(430, duration), opacity: 1, transform: tx(startX, startY, 'rotateZ(-13deg) scale(.96,1.03)') },
      { offset: pct(820, duration), opacity: 1, transform: tx(apexX, apexY, 'rotateZ(-5deg) rotateY(5deg) scale(1.03,.98)'), easing: 'cubic-bezier(.22,.66,.24,1)' },
      { offset: pct(1130, duration), opacity: 1, transform: tx(contactX - 48, contactY - 26, 'rotateZ(7deg) scale(1.05,.96)'), easing: 'cubic-bezier(.2,.72,.18,1)' },
      { offset: pct(1250, duration), opacity: 1, transform: tx(contactX, contactY, 'rotateZ(4deg) scale(.93,1.06)') },
      { offset: pct(1340, duration), opacity: 1, transform: tx(contactX, contactY, 'rotateZ(4deg) scale(.93,1.06)') },
      { offset: pct(1450, duration), opacity: 1, transform: tx(contactX - 18, contactY - 8, 'rotateZ(-12deg) scale(1.01,.98)') },
      { offset: pct(1820, duration), opacity: 1, transform: tx(reboundApexX, reboundApexY, 'rotateZ(-34deg) rotateY(-7deg) scale(.98)') },
      { offset: pct(2200, duration), opacity: 1, transform: tx(landingX + 16, landingY - 24, 'rotateZ(-16deg) scale(1.01,.98)') },
      { offset: pct(2320, duration), opacity: 1, transform: tx(landingX, landingY + 9, 'rotateZ(8deg) scale(1.11,.76)') },
      { offset: pct(2440, duration), opacity: 1, transform: tx(landingX - 7, landingY - 10, 'rotateZ(-10deg) scale(.98,1.04)') },
      { offset: pct(2590, duration), opacity: 1, transform: tx(landingX - 3, landingY + 1, 'rotateZ(-7deg) scale(1.015,.98)') },
      { offset: pct(3450, duration), opacity: 1, transform: tx(landingX - 3, landingY + 1, 'rotateZ(-7deg) scale(1.015,.98)') },
      { offset: pct(4050, duration), opacity: 1, transform: tx(landingX - 3, landingY, 'rotateZ(-1deg) scale(1)') },
      { offset: pct(4370, duration), opacity: 1, transform: tx(landingX + 5, landingY, 'rotateZ(3deg) scale(1)') },
      { offset: pct(5000, duration), opacity: 1, transform: tx(landingX + 5, landingY, 'rotateZ(3deg) scale(1)') },
      { offset: 1, opacity: 1, transform: tx(landingX + 5, landingY, 'rotateZ(3deg) scale(1)') }
    ]);

    run('.shimeLaunchIntro__robotBody', [
      { offset: 0, transform: 'translate3d(0,0,0)' },
      { offset: pct(430, duration), transform: 'translate3d(-7px,2px,0) rotateZ(-2deg)' },
      { offset: pct(820, duration), transform: 'translate3d(-3px,5px,0) rotateZ(-1deg)' },
      { offset: pct(1130, duration), transform: 'translate3d(7px,-2px,0) rotateZ(2deg)' },
      { offset: pct(1250, duration), transform: 'translate3d(-9px,0,0) rotateZ(-2deg) scale(.99,1.01)' },
      { offset: pct(1340, duration), transform: 'translate3d(-9px,0,0) rotateZ(-2deg) scale(.99,1.01)' },
      { offset: pct(1510, duration), transform: 'translate3d(7px,0,0) rotateZ(3deg)' },
      { offset: pct(2200, duration), transform: 'translate3d(1px,5px,0)' },
      { offset: pct(2320, duration), transform: 'translate3d(0,12px,0) scale(1.04,.96)' },
      { offset: pct(2590, duration), transform: 'translate3d(0,0,0)' },
      { offset: pct(2700, duration), transform: 'translate3d(-1px,1px,0) rotateZ(-.5deg)' },
      { offset: pct(2780, duration), transform: 'translate3d(2px,-1px,0) rotateZ(.8deg)' },
      { offset: pct(2890, duration), transform: 'translate3d(-2px,0,0) rotateZ(-.8deg)' },
      { offset: pct(3010, duration), transform: 'translate3d(1px,1px,0) rotateZ(.4deg)' },
      { offset: pct(3150, duration), transform: 'translate3d(-1px,-1px,0) rotateZ(-.5deg)' },
      { offset: pct(3350, duration), transform: 'translate3d(0,0,0)' },
      { offset: pct(3500, duration), transform: 'translate3d(0,0,0) rotateZ(0)' },
      { offset: pct(3600, duration), transform: 'translate3d(-5px,0,0) rotateZ(-2.5deg)' },
      { offset: pct(3710, duration), transform: 'translate3d(5px,0,0) rotateZ(2.3deg)' },
      { offset: pct(3810, duration), transform: 'translate3d(-3px,0,0) rotateZ(-1.5deg)' },
      { offset: pct(3910, duration), transform: 'translate3d(2px,0,0) rotateZ(1deg)' },
      { offset: pct(4050, duration), transform: 'translate3d(0,0,0) rotateZ(0)' },
      { offset: pct(4370, duration), transform: 'translate3d(3px,0,0) rotateZ(1deg)' },
      { offset: 1, transform: 'translate3d(3px,0,0) rotateZ(1deg)' }
    ]);

    run('.shimeLaunchIntro__robotShadow', [
      { offset: 0, opacity: 0, transform: tx(startX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scaleX(.34) scaleY(.5)') },
      { offset: pct(430, duration), opacity: .2, transform: tx(startX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scaleX(1.6) scaleY(.46)') },
      { offset: pct(820, duration), opacity: .12, transform: tx(apexX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scaleX(1.8) scaleY(.38)') },
      { offset: pct(1250, duration), opacity: .66, transform: tx(contactX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.48)') },
      { offset: pct(1820, duration), opacity: .15, transform: tx(reboundApexX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scaleX(1.55) scaleY(.42)') },
      { offset: pct(2320, duration), opacity: .78, transform: tx(landingX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scaleX(.6) scaleY(.55)') },
      { offset: pct(2590, duration), opacity: .5, transform: tx(landingX + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.76)') },
      { offset: pct(5000, duration), opacity: .5, transform: tx(landingX + 8 + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.76)') },
      { offset: 1, opacity: .5, transform: tx(landingX + 8 + robotRect.width / 2, floorY, 'translate(-50%,-50%) scale(.76)') }
    ]);

    run('.shimeLaunchIntro__speedField', [
      { offset: 0, opacity: 0, transform: 'translate3d(-12%,0,0) scaleX(.2)' },
      { offset: pct(350, duration), opacity: 0, transform: 'translate3d(-12%,0,0) scaleX(.2)' },
      { offset: pct(520, duration), opacity: .32, transform: 'translate3d(-5%,0,0) scaleX(.5)' },
      { offset: pct(940, duration), opacity: .78, transform: 'translate3d(8%,0,0) scaleX(1.12)' },
      { offset: pct(1260, duration), opacity: 0, transform: 'translate3d(22%,0,0) scaleX(.42)' },
      { offset: 1, opacity: 0, transform: 'translate3d(22%,0,0) scaleX(.42)' }
    ]);

    run('.shimeLaunchIntro__echo--a', [
      { offset: 0, opacity: 0, transform: 'translate3d(0,0,0) scale(1)' },
      { offset: pct(500, duration), opacity: .18, transform: 'translate3d(-24px,8px,0) scale(.96)' },
      { offset: pct(1040, duration), opacity: .38, transform: 'translate3d(-62px,-10px,0) scale(.9)' },
      { offset: pct(1260, duration), opacity: 0, transform: 'translate3d(-84px,-4px,0) scale(.86)' },
      { offset: 1, opacity: 0 }
    ]);
    run('.shimeLaunchIntro__echo--b', [
      { offset: 0, opacity: 0, transform: 'translate3d(0,0,0) scale(1)' },
      { offset: pct(560, duration), opacity: .1, transform: 'translate3d(-46px,12px,0) scale(.92)' },
      { offset: pct(1080, duration), opacity: .24, transform: 'translate3d(-106px,-16px,0) scale(.82)' },
      { offset: pct(1260, duration), opacity: 0, transform: 'translate3d(-130px,-8px,0) scale(.78)' },
      { offset: 1, opacity: 0 }
    ]);

    run('.shimeLaunchIntro__rock', [
      { offset: 0, opacity: 1, transform: 'translate3d(0,0,0) rotateZ(0) scale(1)' },
      { offset: pct(1240, duration), transform: 'translate3d(0,0,0) rotateZ(0) scale(1)' },
      { offset: pct(1310, duration), transform: 'translate3d(4px,0,0) rotateZ(.8deg) scale(.99,1.005)' },
      { offset: pct(1420, duration), transform: 'translate3d(-2px,0,0) rotateZ(-.45deg) scale(1.004,.998)' },
      { offset: pct(1660, duration), transform: 'translate3d(0,0,0) rotateZ(0) scale(1)' },
      { offset: 1, opacity: 1, transform: 'translate3d(0,0,0) rotateZ(0) scale(1)' }
    ]);

    run('.shimeLaunchIntro__impactRing', [
      { offset: 0, opacity: 0, transform: tx(contactPointX, contactPointY, 'translate(-50%,-50%) scale(.25)') },
      { offset: pct(1230, duration), opacity: 0, transform: tx(contactPointX, contactPointY, 'translate(-50%,-50%) scale(.25)') },
      { offset: pct(1260, duration), opacity: .72, transform: tx(contactPointX, contactPointY, 'translate(-50%,-50%) scale(.5)') },
      { offset: pct(1430, duration), opacity: 0, transform: tx(contactPointX, contactPointY, 'translate(-50%,-50%) scale(1.22)') },
      { offset: 1, opacity: 0 }
    ]);

    root.querySelectorAll('.shimeLaunchIntro__stoneChip').forEach((chip, index) => {
      const vectors = [[-45, -58], [-18, -82], [24, -64], [42, -28], [11, -96]];
      const [x, y] = vectors[index];
      animations.push(chip.animate([
        { offset: 0, opacity: 0, transform: tx(contactPointX, contactPointY, 'rotateZ(0) scale(.5)') },
        { offset: pct(1240, duration), opacity: 0, transform: tx(contactPointX, contactPointY, 'rotateZ(0) scale(.5)') },
        { offset: pct(1290, duration), opacity: .9, transform: tx(contactPointX + x * .22, contactPointY + y * .22, `rotateZ(${index * 18}deg) scale(1)`) },
        { offset: pct(1610, duration), opacity: 0, transform: tx(contactPointX + x, contactPointY + y + 34, `rotateZ(${80 + index * 54}deg) scale(.72)`) },
        { offset: 1, opacity: 0 }
      ], { duration, fill: 'both', easing: 'linear' }));
    });

    run('.shimeLaunchIntro__electric', [
      { offset: 0, opacity: 0, transform: 'translate3d(0,0,0) scale(.65)' },
      { offset: pct(2630, duration), opacity: 0, transform: 'translate3d(0,0,0) scale(.65)' },
      { offset: pct(2700, duration), opacity: .95, transform: 'translate3d(-1px,1px,0) scale(1)' },
      { offset: pct(2790, duration), opacity: .15, transform: 'translate3d(1px,-1px,0) scale(.82)' },
      { offset: pct(2900, duration), opacity: .82, transform: 'translate3d(0,1px,0) scale(1.08)' },
      { offset: pct(3030, duration), opacity: .2, transform: 'translate3d(-1px,0,0) scale(.75)' },
      { offset: pct(3160, duration), opacity: .72, transform: 'translate3d(1px,-1px,0) scale(.94)' },
      { offset: pct(3290, duration), opacity: .12, transform: 'translate3d(0,0,0) scale(.68)' },
      { offset: pct(3420, duration), opacity: .46, transform: 'translate3d(0,0,0) scale(.8)' },
      { offset: pct(3520, duration), opacity: 0, transform: 'translate3d(0,0,0) scale(.6)' },
      { offset: 1, opacity: 0 }
    ]);

    run('.shimeLaunchIntro__oledGlitch', [
      { offset: 0, opacity: 0, transform: 'translate3d(0,0,0)' },
      { offset: pct(2680, duration), opacity: 0, transform: 'translate3d(0,0,0)' },
      { offset: pct(2760, duration), opacity: .7, transform: 'translate3d(4px,0,0)' },
      { offset: pct(2830, duration), opacity: .1, transform: 'translate3d(-2px,0,0)' },
      { offset: pct(2970, duration), opacity: .58, transform: 'translate3d(-4px,0,0)' },
      { offset: pct(3070, duration), opacity: .12, transform: 'translate3d(1px,0,0)' },
      { offset: pct(3220, duration), opacity: .42, transform: 'translate3d(3px,0,0)' },
      { offset: pct(3380, duration), opacity: 0, transform: 'translate3d(0,0,0)' },
      { offset: 1, opacity: 0 }
    ]);

    const expressionFrames = {
      turboExcited: [[0, 0], [340, 0], [390, 1], [1235, 1], [1250, 0], [5150, 0]],
      impactShock: [[0, 0], [1235, 0], [1250, 1], [1435, 1], [1450, 0], [5150, 0]],
      closed: [[0, 0], [1410, 0], [1440, 1], [2740, 1], [2760, 0], [3330, 0], [3350, 1], [3490, 1], [3510, 0], [5150, 0]],
      dazed: [[0, 0], [2740, 0], [2760, 1], [3330, 1], [3350, 0], [5150, 0]],
      recovering: [[0, 0], [3490, 0], [3510, 1], [4140, 1], [4170, 0], [5150, 0]],
      angryRecovery: [[0, 0], [4140, 0], [4170, 1], [5150, 1]]
    };
    for (const [name, entries] of Object.entries(expressionFrames)) {
      run(`.shimeCinematicFace__expression--${name}`, entries.map(([time, opacity]) => ({ offset: pct(time, duration), opacity })));
    }
  }

  const sharedStart = document.timeline.currentTime + 80;
  animations.forEach(animation => { animation.startTime = sharedStart; });
  return animations;
}
