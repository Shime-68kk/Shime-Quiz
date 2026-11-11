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

import ShimeRobotHead, { SHIME_ROBOT_HEAD_SIZES, normalizeShimeRobotHeadSize } from './ShimeRobotHead.jsx';

const STATE_CONFIG = Object.freeze({
  idle:    { label: 'Đang nghỉ' },
  ready:   { label: 'Sẵn sàng' },
  focus:   { label: 'Đang tập trung' },
  success: { label: 'Hoàn thành tốt' },
  warning: { label: 'Cần chú ý' }
});

/**
 * @param {object} props
 * @param {'idle'|'ready'|'focus'|'success'|'warning'} [props.state='idle']
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md']
 * @param {'hardware'|'dot'} [props.eyeVariant='hardware']
 * @param {string} [props.label] - if non-decorative, provide accessible label
 * @param {boolean} [props.decorative=true] - if true, hidden from screen readers
 * @param {boolean} [props.reducedMotion] - override; auto-reads from CSS media if omitted
 * @param {boolean} [props.arrival=false] - one-shot first-session arrival treatment
 * @param {'rest'|'action'} [props.gaze='rest'] - visual gaze direction; never sensor-driven
 */
export default function ShimeRobotPresence({
  state = 'idle',
  size = 'md',
  label,
  decorative = true,
  reducedMotion,
  arrival = false,
  gaze = 'rest',
  expression,
  motion = 'static',
  blinkPhase = 'a',
  onArrivalEnd
}) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const normalizedSize = normalizeShimeRobotHeadSize(size);
  const dimensions = SHIME_ROBOT_HEAD_SIZES[normalizedSize];

  // Prefer prop override, else rely on CSS to disable animation via reduced-motion class
  const disableMotion = typeof reducedMotion === 'boolean' ? reducedMotion : false;

  const containerStyle = {
    width: dimensions.width + (normalizedSize === 'large' ? 12 : 8),
    height: dimensions.height + (normalizedSize === 'large' ? 12 : 8),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0
  };

  const stateClass = `shimeRobotPresence--${state}`;
  const reducedMotionClass = disableMotion ? 'shimeRobotPresence--reduced-motion' : '';
  const arrivalActive = Boolean(arrival && !disableMotion);
  const arrivalClass = arrivalActive ? 'shimeRobotPresence--arrival' : '';
  const normalizedMotion = ['static', 'idle', 'feedback'].includes(motion) ? motion : 'static';
  const normalizedBlinkPhase = ['a', 'b', 'c'].includes(blinkPhase) ? blinkPhase : 'a';
  const faceExpression = expression || (
    state === 'focus' ? 'attentive' : state === 'success' ? 'correct' : state === 'warning' ? 'incorrect' : 'neutral'
  );

  function handleAnimationEnd(event) {
    if (event.target === event.currentTarget && event.animationName === 'bu13-robot-arrival') {
      onArrivalEnd?.();
    }
  }

  return (
    <span
      className={`shimeRobotPresence ${stateClass} shimeRobotPresence--motion-${normalizedMotion} shimeRobotPresence--blink-${normalizedBlinkPhase} ${reducedMotionClass} ${arrivalClass}`.trim()}
      style={containerStyle}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (label || cfg.label)}
      aria-hidden={decorative ? 'true' : undefined}
      data-robot-state={state}
      data-robot-size={normalizedSize}
      data-eye-variant="oled"
      data-robot-arrival={arrivalActive ? 'true' : 'false'}
      data-robot-expression={faceExpression}
      data-robot-motion={normalizedMotion}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Ambient glow layer */}
      <span className="shimeRobotPresence__glow" aria-hidden="true" />
      <ShimeRobotHead
        size={normalizedSize}
        expression={faceExpression}
        wink={arrivalActive}
        gaze={gaze}
        decorative
      />
    </span>
  );
}
