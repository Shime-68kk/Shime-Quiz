import ShimeRobotHead from './ShimeRobotHead.jsx';

const SIZE_CLASS = Object.freeze({
  sm: 'shimeBrandMark--sm',
  md: 'shimeBrandMark--md',
  lg: 'shimeBrandMark--lg'
});

const FACE_SIZE = Object.freeze({
  sm: 'xs',
  md: 'sm',
  lg: 'md'
});

export default function ShimeBrandMark({
  size = 'md',
  decorative = true,
  label = 'Shime'
}) {
  return (
    <span
      className={`shimeBrandMark ${SIZE_CLASS[size] || SIZE_CLASS.md}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      data-eye-variant="oled"
    >
      <ShimeRobotHead size={FACE_SIZE[size] || FACE_SIZE.md} expression="neutral" signal decorative />
    </span>
  );
}
