import { useEffect, useRef } from 'react';
import ShimeRobotHead from '../components/brand/ShimeRobotHead.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';
import { createShimeLaunchTimeline } from './launchTimeline.js';

export default function ShimeLaunchIntro({ onComplete, reducedMotion = false }) {
  const { t } = useShimeLanguage();
  const rootRef = useRef(null);

  useEffect(() => {
    const animations = createShimeLaunchTimeline(rootRef.current, { reducedMotion });
    let cancelled = false;
    Promise.all(animations.map(animation => animation.finished.catch(() => undefined))).then(() => {
      if (!cancelled) onComplete(reducedMotion ? 'reduced-motion' : 'timeline');
    });
    return () => {
      cancelled = true;
      animations.forEach(animation => animation.cancel());
    };
  }, [onComplete, reducedMotion]);

  return (
    <section
      ref={rootRef}
      className={`shimeLaunchIntro${reducedMotion ? ' shimeLaunchIntro--reduced' : ''}`}
      aria-label={t('launch.label')}
      data-shime-launch="active"
      data-scene="scene-1"
    >
      <button type="button" className="shimeLaunchIntro__skip" onClick={() => onComplete('skip')}>
        {t('launch.skip')}
      </button>

      <div className="shimeLaunchIntro__floor" aria-hidden="true" />
      <div className="shimeLaunchIntro__floorRing" aria-hidden="true" />
      <div className="shimeLaunchIntro__speedField" aria-hidden="true"><i /><i /><i /></div>

      <div className="shimeLaunchIntro__rockShadow" aria-hidden="true" />
      <div className="shimeLaunchIntro__rock" aria-hidden="true" data-rock-actor="persistent">
        <i className="shimeLaunchIntro__rockSide" />
        <i className="shimeLaunchIntro__rockFace" />
        <svg className="shimeLaunchIntro__rockCrack" viewBox="0 0 46 80" focusable="false">
          <path d="M35 4 19 27l11 10-18 18 13 7-8 15" />
        </svg>
        <i className="shimeLaunchIntro__rockHighlight" />
      </div>

      <div className="shimeLaunchIntro__robotShadow" aria-hidden="true" />
      <div className="shimeLaunchIntro__robot" aria-hidden="true" data-scene-actor="shime-head">
        <i className="shimeLaunchIntro__echo shimeLaunchIntro__echo--a" />
        <i className="shimeLaunchIntro__echo shimeLaunchIntro__echo--b" />
        <span className="shimeLaunchIntro__robotBody">
          <ShimeRobotHead size="large" expression="cinematic" gaze="action" decorative />
        </span>
        <span className="shimeLaunchIntro__electrics">
          <i className="shimeLaunchIntro__electric shimeLaunchIntro__electric--a" />
          <i className="shimeLaunchIntro__electric shimeLaunchIntro__electric--b" />
          <i className="shimeLaunchIntro__electric shimeLaunchIntro__electric--c" />
          <i className="shimeLaunchIntro__electric shimeLaunchIntro__electric--d" />
        </span>
        <span className="shimeLaunchIntro__oledGlitch">
          <i /><i />
        </span>
      </div>

      <div className="shimeLaunchIntro__impactRing" aria-hidden="true" />
      <div className="shimeLaunchIntro__stoneChips" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <i className="shimeLaunchIntro__stoneChip" key={index} />)}
      </div>
      <div className="shimeLaunchIntro__vignette" aria-hidden="true" />
    </section>
  );
}
