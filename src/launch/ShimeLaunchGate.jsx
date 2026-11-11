import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ShimeLaunchIntro from './ShimeLaunchIntro.jsx';
import { completeShimeLaunch, prefersReducedShimeLaunch, shouldShowShimeLaunch } from './launchLifecycle.js';

export default function ShimeLaunchGate({ children }) {
  const location = useLocation();
  const [reducedMotion] = useState(() => prefersReducedShimeLaunch());
  const [active, setActive] = useState(() => shouldShowShimeLaunch(location.pathname));

  const finish = useCallback(() => {
    completeShimeLaunch();
    setActive(false);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    if (location.pathname !== '/') {
      finish();
      return undefined;
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') finish();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, finish, location.pathname]);

  return (
    <div className={`shimeLaunchGate${active ? ' shimeLaunchGate--active' : ''}`} data-launch-active={active ? 'true' : 'false'}>
      <div className="shimeLaunchGate__app" aria-hidden={active ? 'true' : undefined} inert={active ? true : undefined}>
        {children}
      </div>
      {active ? <ShimeLaunchIntro onComplete={finish} reducedMotion={reducedMotion} /> : null}
    </div>
  );
}
