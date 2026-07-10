# BIG-UPDATE-11 Performance Comparison

## Measurement method

Production measurements use `npm run build` with Vite 7.3.3. File values are the exact minified and gzip sizes printed by Vite. Build time is wall-clock measurement from `/usr/bin/time`; it is environment-sensitive and is not presented as a laboratory benchmark.

## Baseline

| Output | Minified | Gzip |
|---|---:|---:|
| JavaScript | 892.63 kB | 250.61 kB |
| CSS | 134.49 kB | 22.35 kB |
| HTML | 1.81 kB | 0.67 kB |

Baseline build: 283 modules, Vite build 4.10s, wall clock 4.89s. The existing chunk warning was present.

## BIG-UPDATE-11 implementation build

| Output | Minified | Gzip | Delta vs baseline |
|---|---:|---:|---:|
| JavaScript | 899.98 kB | 252.47 kB | +7.35 kB / +1.86 kB gzip |
| CSS | 146.19 kB | 24.60 kB | +11.70 kB / +2.25 kB gzip |
| HTML | 1.81 kB | 0.67 kB | unchanged |

Final implementation build: 287 modules, Vite build 4.87s, wall clock 5.72s. The existing chunk warning remains.

## Interpretation

- JavaScript growth is limited to reusable brand SVG components, accessible disclosure state, and the learner summary component.
- CSS growth is the semantic brand layer plus responsive Home/Overview presentation.
- No image, font, video, canvas, charting, animation, or UI-framework dependency was added.
- No route-level lazy loading was introduced because the existing route contract and StudyRoom stability are more important than a risky late-phase split.
- No continuous motion was added. Existing robot motion remains confined to small elements.

## Perceived-performance improvement

- Home default document height dropped from the technical long-form layout to a concise entry layout with one collapsed technical disclosure.
- Empty-history Overview default height dropped from 3311px to approximately 1719px at 1440px.
- Visible legacy cards in the default progress view dropped from 11 to 0; detailed panels render only after explicit disclosure.

## Remaining risk

The 500 kB chunk warning remains. Route-level lazy loading should be evaluated in a dedicated performance phase with explicit loading/error UI and full route regression coverage. BIG-UPDATE-11 does not claim improved LCP, INP, or CLS without field measurement.
