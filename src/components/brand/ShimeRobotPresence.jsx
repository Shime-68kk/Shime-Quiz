/**
 * ShimeRobotPresence component
 * BIG-UPDATE-10: Robot identity element — decorative/informative
 *
 * Design: Calm robotic study companion identity
 * - CSS-based, no external assets or advanced graphics runtime
 * - transform/opacity animations only
 * - Reduced motion: removes animation, preserves state clarity
 * - Decorative by default (aria-hidden); non-decorative with label
 * - No network, no hardware, no quiz content
 */

import { useMemo } from 'react';

const STATE_CONFIG = Object.freeze({
  idle:    { glow: 'rgba(49, 92, 77, 0.28)', eyeColor: '#5a9e7e', eyeOpacity: 0.7,  pulse: true,  label: 'Đang nghỉ' },
  ready:   { glow: 'rgba(40, 122, 79, 0.38)', eyeColor: '#287a4f', eyeOpacity: 0.95, pulse: false, label: 'Sẵn sàng' },
  focus:   { glow: 'rgba(47, 95, 159, 0.35)', eyeColor: '#2f5f9f', eyeOpacity: 1,   pulse: false, label: 'Đang tập trung' },
  success: { glow: 'rgba(40, 122, 79, 0.45)', eyeColor: '#287a4f', eyeOpacity: 1,   pulse: false, label: 'Hoàn thành tốt' },
  warning: { glow: 'rgba(167, 93, 19, 0.38)', eyeColor: '#a76513', eyeOpacity: 0.9, pulse: false, label: 'Cần chú ý' }
});

const SIZE_CONFIG = Object.freeze({
  sm: { container: 48,  face: 36, eyeR: 3.5, eyeGap: 7,  glowBlur: 16 },
  md: { container: 72,  face: 56, eyeR: 5,   eyeGap: 10, glowBlur: 24 },
  lg: { container: 104, face: 80, eyeR: 7,   eyeGap: 14, glowBlur: 36 }
});

/**
 * @param {object} props
 * @param {'idle'|'ready'|'focus'|'success'|'warning'} [props.state='idle']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label] - if non-decorative, provide accessible label
 * @param {boolean} [props.decorative=true] - if true, hidden from screen readers
 * @param {boolean} [props.reducedMotion] - override; auto-reads from CSS media if omitted
 */
export default function ShimeRobotPresence({
  state = 'idle',
  size = 'md',
  label,
  decorative = true,
  reducedMotion
}) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const sz = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Prefer prop override, else rely on CSS to disable animation via reduced-motion class
  const disableMotion = typeof reducedMotion === 'boolean' ? reducedMotion : false;

  const containerStyle = useMemo(() => ({
    width: sz.container,
    height: sz.container,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0
  }), [sz.container]);

  const glowStyle = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: cfg.glow,
    filter: `blur(${sz.glowBlur}px)`,
    opacity: disableMotion ? 0.6 : undefined,
    // Animation controlled via CSS class + @keyframes; no inline animation
  }), [cfg.glow, sz.glowBlur, disableMotion]);

  const faceStyle = useMemo(() => ({
    position: 'relative',
    width: sz.face,
    height: sz.face,
    borderRadius: '38% 38% 44% 44% / 36% 36% 52% 52%',
    background: 'linear-gradient(160deg, var(--surface-strong, #fff) 0%, var(--color-primary-soft, #e4efe8) 100%)',
    border: '1px solid var(--glass-border, rgba(49,92,77,0.12))',
    boxShadow: `0 4px 16px rgba(36,45,62,0.10), inset 0 1px 0 rgba(255,255,255,0.8)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sz.eyeGap,
    zIndex: 1
  }), [sz]);

  const eyeStyle = useMemo(() => ({
    width: sz.eyeR * 2,
    height: sz.eyeR * 2,
    borderRadius: '50%',
    background: cfg.eyeColor,
    opacity: cfg.eyeOpacity,
    flexShrink: 0,
    boxShadow: `0 0 ${sz.eyeR * 2}px ${cfg.eyeColor}60`
  }), [sz, cfg]);

  const pulseClass = (!disableMotion && cfg.pulse) ? 'shimeRobotPresence__glow--pulse' : '';
  const stateClass = `shimeRobotPresence--${state}`;
  const reducedMotionClass = disableMotion ? 'shimeRobotPresence--reduced-motion' : '';

  return (
    <span
      className={`shimeRobotPresence ${stateClass} ${reducedMotionClass}`.trim()}
      style={containerStyle}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (label || cfg.label)}
      aria-hidden={decorative ? 'true' : undefined}
      data-robot-state={state}
      data-robot-size={size}
    >
      {/* Ambient glow layer */}
      <span
        className={`shimeRobotPresence__glow ${pulseClass}`}
        style={glowStyle}
        aria-hidden="true"
      />
      {/* Robot face */}
      <span
        className="shimeRobotPresence__face"
        style={faceStyle}
        aria-hidden="true"
      >
        {/* Left eye */}
        <span className="shimeRobotPresence__eye" style={eyeStyle} aria-hidden="true" />
        {/* Right eye */}
        <span className="shimeRobotPresence__eye" style={eyeStyle} aria-hidden="true" />
      </span>
    </span>
  );
}
