export const SHIME_OLED_GEOMETRY = Object.freeze({
  viewBox: '0 0 128 64',
  neutral: Object.freeze({
    left: Object.freeze({ x: 27, y: 14, width: 32, height: 36, radius: 8 }),
    right: Object.freeze({ x: 69, y: 14, width: 32, height: 36, radius: 8 }),
    gap: 10
  }),
  attention: Object.freeze({
    left: Object.freeze({ x: 25, y: 13, width: 34, height: 38, radius: 8 }),
    right: Object.freeze({ x: 69, y: 13, width: 34, height: 38, radius: 8 }),
    gap: 10
  })
});

const EXPRESSIONS = new Set(['neutral', 'attentive', 'correct', 'incorrect', 'revealed', 'complete', 'dizzy', 'cinematic']);

function Eye({ side, geometry }) {
  return (
    <rect
      className={`shimeOledFace__eye shimeOledFace__eye--${side}`}
      x={geometry.x}
      y={geometry.y}
      width={geometry.width}
      height={geometry.height}
      rx={geometry.radius}
    />
  );
}

function CinematicExpressions() {
  return (
    <g className="shimeCinematicFace" transform="scale(.64)">
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--turbo shimeCinematicFace__expression--turboExcited" data-scene-expression="TURBO_EXCITED">
        <path className="shimeCinematicFace__eye" d="m20 31 34-17 39 36-39 37-34-18 31-19z" />
        <path className="shimeCinematicFace__eye" d="m180 31-34-17-39 36 39 37 34-18-31-19z" />
        <path className="shimeCinematicFace__eyeSoft" d="m10 23 13-7 4 8-14 6zm180 0-13-7-4 8 14 6z" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--shock shimeCinematicFace__expression--impactShock" data-scene-expression="IMPACT_SHOCK">
        <path className="shimeCinematicFace__eye" d="m28 19 12-7 22 25 22-25 12 7-23 31 23 31-12 7-22-25-22 25-12-7 23-31z" />
        <path className="shimeCinematicFace__eye" d="m104 19 12-7 22 25 22-25 12 7-23 31 23 31-12 7-22-25-22 25-12-7 23-31z" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--dizzy shimeCinematicFace__expression--dazed" data-scene-expression="DAZED">
        <path className="shimeCinematicFace__line" d="M83 49c0-19-31-23-39-5-10 23 31 37 46 13 19-31-32-56-57-24-24 31 12 70 49 54" />
        <path className="shimeCinematicFace__line" d="M166 49c0-19-31-23-39-5-10 23 31 37 46 13 19-31-32-56-57-24-24 31 12 70 49 54" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--annoyed shimeCinematicFace__expression--angryRecovery" data-scene-expression="ANGRY_RECOVERY">
        <path className="shimeCinematicFace__eye" d="m24 24 65 18v39H24zm88 18 65-18v57h-65z" />
        <rect className="shimeCinematicFace__mask" x="63" y="48" width="18" height="27" rx="8" />
        <rect className="shimeCinematicFace__mask" x="151" y="48" width="18" height="27" rx="8" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--closed" data-scene-expression="EYES_CLOSED">
        <path className="shimeCinematicFace__line shimeCinematicFace__line--closed" d="M24 55q31 16 65 0m23 0q31 16 65 0" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--recovering" data-scene-expression="RECOVERING">
        <rect className="shimeCinematicFace__eyeSoft" x="24" y="14" width="66" height="72" rx="24" />
        <rect className="shimeCinematicFace__eyeSoft" x="112" y="14" width="66" height="72" rx="24" />
        <rect className="shimeCinematicFace__mask" x="61" y="32" width="21" height="38" rx="10" />
        <rect className="shimeCinematicFace__mask" x="149" y="32" width="21" height="38" rx="10" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--determined">
        <path className="shimeCinematicFace__eye" d="M24 31 89 18v61H24zM111 18l65 13v48h-65z" />
        <path className="shimeCinematicFace__mask" d="m21 14 72 1-6 24-66 10zM107 15h72v34l-66-10z" />
        <circle className="shimeCinematicFace__mask" cx="72" cy="56" r="8" />
        <circle className="shimeCinematicFace__mask" cx="160" cy="56" r="8" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--smug">
        <path className="shimeCinematicFace__line" d="M27 64q28-34 58 0" />
        <path className="shimeCinematicFace__eye" d="M113 39h62v31h-62z" />
        <path className="shimeCinematicFace__mask" d="M109 27h70v26h-70z" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--panic">
        <rect className="shimeCinematicFace__eyeSoft" x="23" y="10" width="66" height="80" rx="27" />
        <rect className="shimeCinematicFace__eyeSoft" x="111" y="10" width="66" height="80" rx="27" />
        <circle className="shimeCinematicFace__mask" cx="70" cy="35" r="13" />
        <circle className="shimeCinematicFace__mask" cx="158" cy="35" r="13" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--impact">
        <rect className="shimeCinematicFace__eye" x="20" y="41" width="72" height="18" rx="9" />
        <rect className="shimeCinematicFace__eye" x="108" y="41" width="72" height="18" rx="9" />
        <path className="shimeCinematicFace__eyeSoft" d="M96 18h8v64h-8z" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--tumble">
        <g transform="rotate(-22 57 50)"><path className="shimeCinematicFace__eye" d="m27 24 10-6 20 23 20-23 10 6-21 26 21 26-10 6-20-23-20 23-10-6 21-26z" /></g>
        <g transform="rotate(18 143 50)" opacity=".7"><path className="shimeCinematicFace__eye" d="M111 27h64v19l-17 27h-47z" /></g>
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--side">
        <rect className="shimeCinematicFace__eyeSoft" x="24" y="18" width="66" height="64" rx="22" />
        <rect className="shimeCinematicFace__eyeSoft" x="112" y="18" width="66" height="64" rx="22" />
        <rect className="shimeCinematicFace__mask" x="59" y="26" width="23" height="48" rx="11" />
        <rect className="shimeCinematicFace__mask" x="147" y="26" width="23" height="48" rx="11" />
      </g>
      <g className="shimeCinematicFace__expression shimeCinematicFace__expression--delight">
        <path className="shimeCinematicFace__line" d="M24 67q33-47 66 0M110 67q33-47 66 0" />
      </g>
    </g>
  );
}

export default function ShimeOledFace({
  expression = 'neutral',
  wink = false,
  gaze = 'rest',
  decorative = true,
  label = 'Shime OLED face'
}) {
  const normalizedExpression = EXPRESSIONS.has(expression) ? expression : 'neutral';
  return (
    <svg
      className={`shimeOledFace shimeOledFace--${normalizedExpression} shimeOledFace--gaze-${gaze}${wink ? ' shimeOledFace--wink' : ''}`}
      viewBox={SHIME_OLED_GEOMETRY.viewBox}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
      data-oled-expression={normalizedExpression}
      data-oled-viewbox={SHIME_OLED_GEOMETRY.viewBox}
    >
      <rect className="shimeOledFace__surface" x="0.75" y="0.75" width="126.5" height="62.5" rx="15" />
      {normalizedExpression === 'cinematic' ? <CinematicExpressions /> : <g className="shimeOledFace__eyes">
        <g className="shimeOledFace__eyeGeometry shimeOledFace__eyeGeometry--neutral">
          <Eye side="left" geometry={SHIME_OLED_GEOMETRY.neutral.left} />
          <Eye side="right" geometry={SHIME_OLED_GEOMETRY.neutral.right} />
          <g className="shimeOledFace__mask shimeOledFace__mask--happy">
            <rect x="26" y="33" width="34" height="36" rx="8" />
            <rect x="68" y="33" width="34" height="36" rx="8" />
          </g>
          <g className="shimeOledFace__mask shimeOledFace__mask--tired">
            <path d="M26 13H60L60 14L26 27Z" />
            <path d="M68 13H102L102 27L68 14Z" />
          </g>
          <g className="shimeOledFace__mask shimeOledFace__mask--angry">
            <path d="M26 13H60L60 27L26 14Z" />
            <path d="M68 13H102L102 14L68 27Z" />
          </g>
        </g>
        <g className="shimeOledFace__eyeGeometry shimeOledFace__eyeGeometry--attention">
          <Eye side="left" geometry={SHIME_OLED_GEOMETRY.attention.left} />
          <Eye side="right" geometry={SHIME_OLED_GEOMETRY.attention.right} />
        </g>
      </g>}
    </svg>
  );
}
