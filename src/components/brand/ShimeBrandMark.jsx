import ShimeLogoMark from './ShimeLogoMark.jsx';

// The app's brand mark is the Shime logo ("Nháy mắt đúng", 2026-11-11).
// The animated companion robot (ShimeRobotPresence / ShimeRobotHead) is unchanged.
const SIZE_CLASS = Object.freeze({
  sm: 'shimeBrandMark--sm',
  md: 'shimeBrandMark--md',
  lg: 'shimeBrandMark--lg'
});

const PIXELS = Object.freeze({ sm: 30, md: 40, lg: 54 });

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
    >
      <ShimeLogoMark size={PIXELS[size] || PIXELS.md} tile="app" decorative />
    </span>
  );
}
