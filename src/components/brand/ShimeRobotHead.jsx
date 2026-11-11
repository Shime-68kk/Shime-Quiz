import ShimeOledFace from './ShimeOledFace.jsx';

export const SHIME_ROBOT_HEAD_SIZES = Object.freeze({
  compact: Object.freeze({ width: 30, height: 24 }),
  small: Object.freeze({ width: 48, height: 38 }),
  medium: Object.freeze({ width: 86, height: 68 }),
  large: Object.freeze({ width: 152, height: 120 })
});

const SIZE_ALIASES = Object.freeze({
  xs: 'compact',
  sm: 'small',
  md: 'medium',
  lg: 'large'
});

export function normalizeShimeRobotHeadSize(size = 'medium') {
  if (SHIME_ROBOT_HEAD_SIZES[size]) return size;
  return SIZE_ALIASES[size] || 'medium';
}

export default function ShimeRobotHead({
  size = 'medium',
  expression = 'neutral',
  wink = false,
  gaze = 'rest',
  signal = false,
  decorative = true,
  label = 'Shime robot'
}) {
  const normalizedSize = normalizeShimeRobotHeadSize(size);
  const dimensions = SHIME_ROBOT_HEAD_SIZES[normalizedSize];

  return (
    <span
      className={`shimeRobotHead shimeRobotHead--${normalizedSize} shimeRobotHead--${expression}`}
      style={{ '--shime-head-width': `${dimensions.width}px`, '--shime-head-height': `${dimensions.height}px` }}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      data-robot-head-size={normalizedSize}
      data-robot-expression={expression}
    >
      {signal ? <span className="shimeRobotHead__signal" aria-hidden="true" /> : null}
      <span className="shimeRobotHead__display" aria-hidden="true">
        <ShimeOledFace expression={expression} wink={wink} gaze={gaze} decorative />
      </span>
    </span>
  );
}
