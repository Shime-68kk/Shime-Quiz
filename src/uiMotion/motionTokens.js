/**
 * Shime Quiz — Motion Tokens
 * BIG-UPDATE-10: Premium UI Motion System
 *
 * Rules:
 * - All animations use transform/opacity only (no layout thrashing)
 * - Short durations: 120–240ms standard
 * - No blocking intro animations
 * - No delay before user can interact
 * - Reduced motion path: 0ms duration, state still clear
 * - No animation library dependency (pure CSS variables + JS constants)
 */

export const durationFast = 120;
export const durationNormal = 180;
export const durationSlow = 240;
export const reducedMotionDuration = 0;

export const easingStandard = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
export const easingEmphasized = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const easingDecelerate = 'cubic-bezier(0.0, 0.0, 0.2, 1)';
export const easingAccelerate = 'cubic-bezier(0.4, 0.0, 1, 1)';

/**
 * CSS custom properties string for injection into :root
 * These must be applied via the stylesheet, not inline styles.
 */
export const MOTION_CSS_VARS = `
  --motion-duration-fast: ${durationFast}ms;
  --motion-duration-normal: ${durationNormal}ms;
  --motion-duration-slow: ${durationSlow}ms;
  --motion-easing-standard: ${easingStandard};
  --motion-easing-emphasized: ${easingEmphasized};
  --motion-easing-decelerate: ${easingDecelerate};
  --motion-easing-accelerate: ${easingAccelerate};
`;

/**
 * Get effective duration respecting prefers-reduced-motion.
 * Safe to call in pure JS contexts (no DOM required).
 * @param {number} duration - nominal duration in ms
 * @param {boolean} [isReducedMotion] - override; auto-detected from window.matchMedia if omitted
 * @returns {number}
 */
export function getEffectiveDuration(duration, isReducedMotion) {
  if (typeof isReducedMotion === 'boolean') {
    return isReducedMotion ? reducedMotionDuration : duration;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mq.matches ? reducedMotionDuration : duration;
  }
  return duration;
}

/**
 * Build a CSS transition string for transform+opacity animations.
 * @param {number} duration - ms
 * @param {string} [easing] - CSS easing string
 * @returns {string}
 */
export function buildTransition(duration = durationNormal, easing = easingStandard) {
  return `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
}

/**
 * Named motion presets for common Shime UI patterns.
 * Each preset is a plain object — no DOM, no React dependency.
 */
export const MOTION_PRESETS = Object.freeze({
  heroEntry: {
    property: 'opacity, transform',
    duration: durationSlow,
    easing: easingDecelerate,
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  robotPulse: {
    property: 'opacity, transform',
    duration: 2400,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
    from: { opacity: 0.7, transform: 'scale(0.97)' },
    to: { opacity: 1, transform: 'scale(1)' }
  },
  ctaHover: {
    property: 'transform, box-shadow',
    duration: durationFast,
    easing: easingEmphasized,
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-2px)' }
  },
  cardReveal: {
    property: 'opacity, transform',
    duration: durationNormal,
    easing: easingDecelerate,
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  robotStateTransition: {
    property: 'opacity, transform',
    duration: durationNormal,
    easing: easingStandard,
    from: { opacity: 0.6, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' }
  }
});

export const MOTION_TOKEN_VERSION = 'big-update-10';
