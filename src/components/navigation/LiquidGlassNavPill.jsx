import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Liquid-glass tab pill (student deployment request, 2026-11-11).
//
// BIG-UPDATE-13 removed the old moving indicator because the active NavLink
// painted its own background immediately while the indicator was still
// travelling, so two active surfaces were visible at once. This pill avoids
// that: it is the ONLY active surface (the active link keeps just its colour,
// see .bottomNav--liquid in global.css) and it is positioned from the active
// link's measured box, so nested paths and any item count work.
//
// Motion: FLIP from the previous box to the new one with a short liquid
// stretch in the middle. Reduced motion → it jumps without animation.

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export default function LiquidGlassNavPill({ hostRef, activeSelector }) {
  const location = useLocation();
  const pillRef = useRef(null);
  const lastBoxRef = useRef(null);

  const place = animate => {
    const host = hostRef.current;
    const pill = pillRef.current;
    if (!host || !pill) return;
    const active = host.querySelector(activeSelector);
    if (!active) {
      pill.style.opacity = '0';
      lastBoxRef.current = null;
      return;
    }
    const box = {
      left: active.offsetLeft,
      top: active.offsetTop,
      width: active.offsetWidth,
      height: active.offsetHeight
    };
    const prev = lastBoxRef.current;
    pill.style.left = `${box.left}px`;
    pill.style.top = `${box.top}px`;
    pill.style.width = `${box.width}px`;
    pill.style.height = `${box.height}px`;
    pill.style.opacity = '1';
    lastBoxRef.current = box;

    if (!animate || !prev || prev.left === box.left || typeof pill.animate !== 'function' || prefersReducedMotion()) return;
    const dx = prev.left - box.left;
    const fromScale = prev.width / box.width;
    pill.animate(
      [
        { transform: `translateX(${dx}px) scaleX(${fromScale})` },
        { transform: `translateX(${dx * 0.42}px) scaleX(${1.22}) scaleY(0.86)`, offset: 0.42 },
        { transform: 'translateX(0) scaleX(0.96) scaleY(1.04)', offset: 0.78 },
        { transform: 'none' }
      ],
      { duration: 460, easing: 'cubic-bezier(0.22, 0.9, 0.3, 1)' }
    );
  };

  useLayoutEffect(() => {
    place(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    let observer = null;
    if (typeof ResizeObserver === 'function' && hostRef.current) {
      observer = new ResizeObserver(onResize);
      observer.observe(hostRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span ref={pillRef} className="liquidNavPill" aria-hidden="true" style={{ opacity: 0 }} />;
}
