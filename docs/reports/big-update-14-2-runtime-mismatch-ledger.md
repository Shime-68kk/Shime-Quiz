# BIG-UPDATE-14.2 Runtime Mismatch Ledger

## Evidence

- Old app runtime: `output/playwright/big-update-14-2-runtime/old-runtime-desktop.webm`
- Approved motion specification: `docs/design/big-update-14-2-animatic.html`
- New app runtime: `output/playwright/big-update-14-2-runtime/runtime-desktop.webm`
- New mobile runtime: `output/playwright/big-update-14-2-runtime/runtime-mobile.webm`

## Runtime Comparison

| Check | Old app runtime | Approved animatic | New app runtime | Result |
| --- | --- | --- | --- | --- |
| Actor scale | Icon-sized robot with excessive empty stage | Robot is the main staged actor | Responsive 178–220px desktop head and 172–196px mobile head | Fixed |
| Pillar visibility | Thin line with no readable volume | Cylindrical, capped, banded object | Substantial fluted cylinder with cap, theme band, crack and dent | Fixed |
| Leg length | Short strokes below the head | Long telescoping mechanical legs | Planted leg at 66% and kicking leg at 94% of head height | Fixed |
| Kick contact | Contact is not visually legible | Foot overlaps pillar for 60–90ms | Geometry-verified overlap with an 80ms contact hold and recoil | Fixed |
| Expression clarity | Small variations of rectangular eyes | Eleven distinct OLED silhouettes | Eleven explicit SVG expression groups on one face | Fixed |
| Pillar continuity | Departure and return are difficult to identify | One persistent damaged pillar | One DOM actor retains cap, band, crack, dent and proportions | Fixed |
| Pillar return | Fast lateral movement with weak depth | 1.4–1.7s arc, apex pause, vertical drop | 1.65s depth-scaled arc, 200ms apex hold and vertical impact | Fixed |
| Title centering | Small title with short visibility | Large viewport-centered `Shime Quiz` | Serif title remains centered independently of the robot | Fixed |
| Final hold | No full two-second composition | Approximately two seconds | Full composition holds from 10.05s to 12.05s | Fixed |
| Mobile framing | Small actor but weak story readability | Large, safe mobile composition | No horizontal overflow; kick, impact and final frame remain in bounds | Fixed |
| Theme appearance | Minimal environmental response | Theme-aware stage and actor accents | Light, Dark and Lavender roles drive stage, band, OLED and title | Fixed |

## Conclusion

The production runtime now matches the approved animatic much more closely and is materially different from the old runtime. The implementation changes only launch presentation/lifecycle files, shared OLED expression markup, focused validators/tests, and this ledger; learning, scheduler, storage, Safe Capsule and bridge logic remain unchanged.
