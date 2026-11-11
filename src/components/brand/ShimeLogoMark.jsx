// Shime logo — "Nháy mắt đúng" (check wink), chosen 2026-11-11.
// The Shime robot head (rounded shell, dark visor, mint OLED eyes, antenna) where
// the right eye is a check mark: the robot winks when you get it right.
// Flat shapes only so it stays legible down to 16px.
//
// tile="app"  → coloured rounded tile (sidebar, favicon)
// tile="none" → the head alone, shell in the theme colour
// Colours follow the active theme's brand token; eyes stay mint.

export const SHIME_LOGO_EYE = '#3FE0A0';
export const SHIME_LOGO_INK = '#1C1433';
export const SHIME_LOGO_SHELL = '#F6F2FF';

export function ShimeLogoShapes({ shell, visor = SHIME_LOGO_INK, eye = SHIME_LOGO_EYE }) {
  return (
    <>
      <rect x="56.5" y="8" width="7" height="16" rx="3.5" fill={shell} />
      <circle cx="60" cy="9" r="6.5" fill={eye} />
      <rect x="10" y="20" width="100" height="86" rx="32" fill={shell} />
      <rect x="22" y="38" width="76" height="48" rx="20" fill={visor} />
      <rect x="37" y="50" width="16" height="24" rx="7.5" fill={eye} />
      <path
        d="M64.5 62.5 L71.5 69.5 L85 54"
        fill="none"
        stroke={eye}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export default function ShimeLogoMark({ size = 32, tile = 'app', decorative = true, label = 'Shime' }) {
  const accent = 'var(--theme-brand-primary, #7C5CE0)';
  return (
    <svg
      className={`shimeLogoMark shimeLogoMark--${tile}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
      data-shime-logo="check-wink"
    >
      {tile === 'app' ? (
        <>
          <rect width="120" height="120" rx="27" fill={accent} />
          <g transform="translate(14 16) scale(0.7667)">
            <ShimeLogoShapes shell={SHIME_LOGO_SHELL} />
          </g>
        </>
      ) : (
        <ShimeLogoShapes shell={accent} />
      )}
    </svg>
  );
}
