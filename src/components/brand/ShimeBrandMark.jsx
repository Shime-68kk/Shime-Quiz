const SIZE_CLASS = Object.freeze({
  sm: 'shimeBrandMark--sm',
  md: 'shimeBrandMark--md',
  lg: 'shimeBrandMark--lg'
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
    >
      <svg viewBox="0 0 36 36" focusable="false" aria-hidden="true">
        <path className="shimeBrandMark__shell" d="M18 5.5c7.2 0 12.5 5 12.5 12.1v2.8c0 6-4.7 10.1-12.5 10.1S5.5 26.4 5.5 20.4v-2.8C5.5 10.5 10.8 5.5 18 5.5Z" />
        <path className="shimeBrandMark__face" d="M10 15.1c0-3.3 2.6-5.6 5.8-5.6h4.4c3.2 0 5.8 2.3 5.8 5.6v4.3c0 3.2-2.5 5.4-5.7 5.4h-4.6c-3.2 0-5.7-2.2-5.7-5.4Z" />
        <circle className="shimeBrandMark__eye" cx="15" cy="17.2" r="1.7" />
        <circle className="shimeBrandMark__eye" cx="21" cy="17.2" r="1.7" />
        <path className="shimeBrandMark__signal" d="M18 5.5V3.2m-2.4 0h4.8" />
      </svg>
    </span>
  );
}
