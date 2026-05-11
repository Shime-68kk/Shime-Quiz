# Phase 13A — Review Engine Claim Boundaries

Phase 13A documents the current review engine. It does not implement runtime FSRS, does not add dependencies, does not change package files, and does not change scheduler behavior.

## Safe current claims

The following claims are safe after Phase 13A:

- Shime has a browser-local review schedule.
- Shime has an SM-2-like / heuristic spaced repetition scheduler.
- Shime has weighted practice selection.
- Shime uses local/browser storage for core study data.
- Shime can document future FSRS planning.
- Shime can describe FSRS as planned, future, not implemented, not publicly claimable yet, requiring a separate approved runtime phase, and research reference only.

## Forbidden current claims

The following claims are forbidden after Phase 13A unless a later approved runtime phase implements and verifies them:

- FSRS is implemented.
- Glicko-2 is implemented.
- IRT/adaptive rating is implemented.
- Transformers.js/local AI is implemented.
- Semantic search is implemented.
- PowerSync is implemented.
- ElectricSQL is implemented.
- Automatic sync is implemented.
- Cloud/account sync is implemented.
- IndexedDB migration is implemented.
- Encryption is implemented.
- Built-in AI quiz generation is implemented.
- External AI/API integration is implemented.
- API key/BYOK support exists.
- OCR exists.
- Release package/tag/GitHub Release has been created by Phase 13A.
- Production/security/accessibility/performance certification exists.

## Required safe language

Future/planned work must be clearly marked with language such as:

- planned
- future
- not implemented
- not publicly claimable yet
- requires separate approved runtime phase
- research reference only

## Unsafe language unless proven later

Avoid the following language for FSRS, Glicko-2, IRT/adaptive rating, local AI, semantic search, sync, IndexedDB, encryption, OCR, external APIs, or release execution unless later runtime evidence and validation exist:

- implemented
- shipped
- available
- supported
- production-ready
- certified
- automatic
- integrated

## Phase 13A public wording examples

Safe:

- Shime currently uses a browser-local SM-2-like / heuristic scheduler.
- FSRS is a future migration direction and is not implemented in Phase 13A.
- `ts-fsrs-main.zip` is research reference only for this phase.
- A runtime FSRS migration requires a separate approved runtime phase.

Unsafe:

- Shime has FSRS.
- Shime supports FSRS scheduling.
- Shime now uses FSRS difficulty, stability, and retrievability.
- Shime has automatic sync or cloud account sync.
- Shime completed an IndexedDB migration.
- Shime is production/security/accessibility/performance certified.
