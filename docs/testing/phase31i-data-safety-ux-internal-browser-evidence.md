# Phase 31I — Data Safety UX Internal Browser Evidence

## Status tokens

```text
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_STATUS: COMPLETED_INTERNAL_BROWSER_EVIDENCE_REVIEW
PHASE31I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE
PHASE31I_EVIDENCE_SCOPE: INTERNAL_BROWSER_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED
PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31I reviews actual browser evidence for the Phase 31G Data Safety UX internal visibility implementation. No src, tests, e2e, package, or prior phase files are modified. No backup/export/restore behavior, storage drivers, or sync/cloud/backend modules are touched. No runtime behavior changes are made.

## Inputs from Phase 31H

Phase 31H reviewed static/unit evidence and returned:
```text
PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_STATUS: COMPLETED_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
PHASE31H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
PHASE31H_EVIDENCE_SCOPE: INTERNAL_VISIBILITY_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31H kept browser evidence as a deferred gate. Phase 31I executes that gate.

## Browser evidence source

- Source type: `DIRECT_BROWSER_RUN_RECORDED`
- Method: Node.js script using `@playwright/test` Chromium browser automation
- Environment: Linux, DISPLAY=:0, Chromium available at `/usr/bin/chromium-browser`
- Playwright version: 1.60.0
- Node.js: v18.19.1
- Date executed: 2026-05-25
- Script location: `/tmp/phase31i-browser-evidence.cjs` (not committed; evidence output recorded here)
- Screenshots captured: `/tmp/phase31i-screenshots/` (3 screenshots, not committed)
- Results JSON: `/tmp/phase31i-browser-evidence-results.json` (not committed)

## Browser evidence method

For each lane:
1. Built the Vite production bundle with lane-specific environment overrides (`npm run build`)
2. Started the Vite preview server (`npm run preview`, port 4173)
3. Navigated Playwright Chromium headlessly to `http://127.0.0.1:4173/settings`
4. Observed: presence/absence of `[data-testid="data-safety-center-prototype"]`
5. Observed: presence/absence of user-visible toggle (`[data-testid*="data-safety"]` count)
6. Observed: button disabled/ariaDisabled state in prototype (lane 3 only)
7. Observed: `localStorage` key count and data-safety-specific key count
8. Observed: external network request list (URLs not starting with `127.0.0.1`)
9. Observed: console error list
10. Observed: `BETA_READY` text occurrence count on page
11. Captured full-page screenshot

All observations are from direct browser runtime, not from reading source or test files.

## Browser evidence table

| Lane | Evidence source | Steps reviewed | Observed result | Status | Limitation | Decision impact | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| default no-env Settings hidden | Direct Playwright run, no env flag, prod build | Navigate to /settings; check data-testid presence | `data-safety-center-prototype` count: 0; Settings page loads ("Cài đặt") | PASS | Single-session snapshot; no prolonged soak test | Confirms default-off in prod build | Default build hides prototype | Production user sees prototype |
| invalid env Settings hidden | Direct Playwright run, `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=invalid` | Navigate to /settings; check data-testid presence | `data-safety-center-prototype` count: 0 | PASS | Single env variant; other invalid values covered by unit tests | Confirms invalid values rejected | Invalid flag hides prototype | Invalid flag enables prototype |
| explicit internal env Settings visible | Direct Playwright run, `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1` | Navigate to /settings; check data-testid presence | `data-safety-center-prototype` count: 1 (prototype container visible) | PASS | Single flag variant; `true`/`enabled` covered by unit tests | Confirms internal flag enables prototype | Explicit flag shows prototype to internal/dev | Ordinary user can see prototype without flag |
| no user-visible toggle | Direct Playwright run, flag=1 | Check `[data-testid*="data-safety"]` count | Count: 1 (prototype container itself, no separate toggle element) | PASS | Only testid selector; visual inspection of screenshot confirms no toggle UI | Confirms no user-toggle added | No toggle in rendered UI | Toggle exists or is hidden |
| placeholder/inert actions | Direct Playwright run, flag=1 | Check button `disabled` and `aria-disabled` attributes in prototype | "Xuất bản sao lưu (chưa hoạt động)": disabled=true, aria-disabled=true; "Nhập bản sao lưu (chưa hoạt động)": disabled=true, aria-disabled=true | PASS | Only 2 buttons inspected; "chưa hoạt động" = "not working" label visible in text | Confirms buttons are inert placeholders | Buttons are disabled placeholders | Click handlers invoke backup/restore APIs |
| no backup/export/restore execution | Direct Playwright run, flag=1 | Observe button states; check no backup/export/restore API calls in network or storage | Buttons both disabled/ariaDisabled; 0 external requests; 0 storage writes | PASS | Cannot dynamically click disabled buttons; static disable confirmed | Confirms no backup/restore executed | Prototype renders inert buttons | Prototype executes backup/restore on load or click |
| storage snapshot / no unexpected storage writes | Direct Playwright run, all 3 lanes | Enumerate localStorage after /settings render | localStorage keys: 0 in all lanes; data-safety-specific keys: [] in all lanes | PASS | Snapshot taken after 1.2s wait; no prolonged persistence test | Confirms no storage writes on load or render | No storage written by prototype or helper | Prototype persists state to localStorage |
| network/backend/telemetry absence | Direct Playwright run, all 3 lanes | Monitor all HTTP requests with URL not matching 127.0.0.1 | External requests: [] in all lanes | PASS | Only outbound HTTP requests captured; no WebSocket/sendBeacon intercept (not expected) | Confirms no external calls | No external requests from prototype render | Prototype makes external API/telemetry calls |
| rollback by removing env flag | Lane 1 (no-env build) serves as rollback evidence | Remove `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` → rebuild → navigate | Lane 1 observed: prototype hidden (count: 0) | PASS | Rollback by env removal only; not tested by git revert; unit tests confirm pure function | Confirms env flag removal restores hidden state | Removing env flag hides prototype | Removing flag has no effect |
| BETA_READY absence | Direct Playwright run, flag=1 (prototype visible) | Check page text for literal `BETA_READY` string | BETA_READY text count: 3 — all occurrences are in prototype's "does not approve" statements (e.g., "Phase 31C does not approve BETA_READY") | PASS WITH NOTE | Text "BETA_READY" appears 3× in prototype copy as part of explicit "does not approve" messaging; not as a claim or approval | No BETA_READY approval claim visible; "does not approve" copy is expected | Prototype displays "does not approve BETA_READY" | BETA_READY claimed or approved in UI |
| ordinary-user visibility absence | Lanes 1+2 (no flag, invalid flag) | Check prototype presence in default and invalid-env builds | Prototype hidden in both lanes: count 0; ordinary users cannot set `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` (build-time env var) | PASS | Ordinary-user defined as: cannot set internal build-time env flags; no runtime toggle | Confirms ordinary users do not see prototype | Ordinary users see no data safety section | Ordinary users can enable the prototype |

## Default no-env lane

**Build env:** `{}` (no VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY set)

**Observed:**
- HTTP status: 200 (Settings page loads)
- `data-safety-center-prototype` present: `false`
- `[data-testid*="data-safety"]` count: 0
- localStorage total keys: 0
- data-safety localStorage keys: `[]`
- BETA_READY text on page: 0
- External network requests: `[]`
- Console errors: `[]`
- Page heading: "Cài đặt"

**Conclusion:** Default build (no flag) hides the Data Safety Center prototype completely. Settings page renders correctly with FSRS, EduGen, and other panels. No data-safety elements visible.

## Invalid env lane

**Build env:** `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=invalid`

**Observed:**
- HTTP status: 200
- `data-safety-center-prototype` present: `false`
- `[data-testid*="data-safety"]` count: 0
- localStorage total keys: 0
- data-safety localStorage keys: `[]`
- BETA_READY text on page: 0
- External network requests: `[]`
- Console errors: `[]`
- Page heading: "Cài đặt"

**Conclusion:** Invalid env value is rejected by `shouldEnableDataSafetyInternalVisibility`. Prototype remains hidden. Identical to no-env lane.

## Explicit internal env lane

**Build env:** `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1`

**Observed:**
- HTTP status: 200
- `data-safety-center-prototype` present: `true`
- `[data-testid*="data-safety"]` count: 1 (prototype container only, no toggle element)
- Buttons in prototype:
  - "Xuất bản sao lưu (chưa hoạt động)" — `disabled=true`, `aria-disabled=true`
  - "Nhập bản sao lưu (chưa hoạt động)" — `disabled=true`, `aria-disabled=true`
- localStorage total keys: 0
- data-safety localStorage keys: `[]`
- BETA_READY text on page: 3 (all in "does not approve" copy — see BETA_READY absence lane)
- External network requests: `[]`
- Console errors: `[]`
- Page heading: "Cài đặt"

**Conclusion:** With explicit internal flag, the Data Safety Center prototype section is visible. No user-visible toggle. Both action buttons are disabled and labeled "(chưa hoạt động)" (not working). No storage writes, no external requests.

## Placeholder action lane

Both buttons in the visible prototype use `disabled` and `aria-disabled="true"`:
- "Xuất bản sao lưu (chưa hoạt động)" — export backup placeholder
- "Nhập bản sao lưu (chưa hoạt động)" — import backup placeholder

Neither button triggers backup, export, restore, or storage APIs. Click handlers are not invokable via the browser (buttons are disabled). The labels "(chưa hoạt động)" explicitly communicate non-functionality to any internal user who sees the prototype.

## Storage and network lane

Across all three build lanes, at `/settings` after 1.2 seconds:
- `localStorage.length` = 0 in all lanes
- No localStorage keys matching `data-safety`, `datasafety`, or `data_safety`
- No external HTTP requests (URLs outside `127.0.0.1`)
- No console errors (no JS runtime errors or warnings)

The `dataSafetyInternalVisibility.js` helper is a pure function module with no side effects. No storage or network APIs are present in the module or in the Settings integration.

## Rollback lane

Rollback evidence is established by Lane 1 (no-env build):
- Removing `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` from the build environment produces a build identical in behavior to the default no-env build.
- The prototype is hidden: `data-safety-center-prototype` count = 0.
- The helper module exports are pure functions. Removing the env flag (or reverting Settings.jsx to use `{}` instead of `createDataSafetyInternalVisibilityConfig(import.meta.env)`) restores the hidden state.
- No state is persisted across builds; rollback is lossless.

## Evidence limitations

1. **Single-session snapshots.** Each lane was a single browser session, not a prolonged soak test.
2. **Three flag value variants tested directly.** `1` (browser), `invalid` (browser), no-flag (browser). `true` and `enabled` are covered by unit tests (Phase 31G) but not re-run in browser here.
3. **Headless Playwright, not interactive user.** Evidence is from automated browser, not manual user interaction.
4. **Rollback by env removal only.** Rollback by `git revert` was not tested separately; it is expected to be equivalent.
5. **No prolonged persistence check.** localStorage was checked after 1.2s stabilization; no multi-minute observation.
6. **WebSocket/sendBeacon not intercepted.** Only HTTP requests captured. No WebSocket or sendBeacon APIs are expected or observed in the source.

## Chosen browser evidence decision

```text
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE
```

## Decision rationale

All 11 required browser lanes passed:

1. Default no-env → hidden ✅
2. Invalid env → hidden ✅
3. Explicit internal flag → visible ✅
4. No user-visible toggle ✅
5. Placeholder/inert actions ✅
6. No backup/export/restore execution ✅
7. No unexpected storage writes ✅
8. No external network/backend/telemetry calls ✅
9. Rollback by env removal confirmed ✅
10. BETA_READY not claimed or approved (3× appears in "does not approve" copy) ✅
11. Ordinary-user visibility absent ✅

No blocking findings. The BETA_READY text finding is a clarification, not a failure: the prototype displays "Phase 31C does not approve BETA_READY" as part of its internal diagnostic copy. This is expected behavior.

The direct browser evidence confirms that the Phase 31G implementation behaves as designed:
- Pure function helper with no side effects
- Default-off in production builds
- Internal opt-in via build-time env flag only
- Inert placeholder buttons; no backup/restore execution
- No storage writes or network calls on render

## What Phase 31I supports

- Confirms Phase 31G internal visibility implementation behaves correctly in browser
- Establishes direct browser evidence for default-off, invalid-env-hidden, and internal-flag-visible lanes
- Confirms placeholder/inert button state in visible prototype
- Confirms absence of storage writes and external network calls
- Confirms absence of user-visible toggle
- Confirms rollback by env flag removal
- Prepares Phase 31J visibility re-decision seed
- `LIMITED_BETA_CANDIDATE` remains the highest approved readiness status

## What Phase 31I does not approve

Phase 31I does not approve BETA_READY.
Phase 31I does not approve public production readiness.
Phase 31I does not approve guaranteed data-loss prevention.
Phase 31I does not approve restore execution.
Phase 31I does not approve production restore rehearsal.
Phase 31I does not approve real learner data restore rehearsal.
Phase 31I does not approve runtime backup/export/restore behavior changes.
Phase 31I does not approve backup file format changes.
Phase 31I does not approve restore overwrite behavior changes.
Phase 31I does not approve storage migration.
Phase 31I does not approve sync/cloud/account/auth/backend.
Phase 31I does not approve telemetry/analytics.
Phase 31I does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31I does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31I does not approve limited settings visibility to ordinary users.

## Claim boundary

Phase 31I confirms: browser evidence shows Phase 31G internal visibility behaves as designed. Default-off, internal-flag-optional, inert actions, no storage writes, no external calls.

Phase 31I does not confirm: production readiness, BETA_READY, or any expansion of ordinary-user visibility. These require separate decision phases.

## Next recommended phase

Next recommended phase: Phase 31J — Data Safety UX Visibility Re-Decision

Phase 31J is a separate visibility re-decision gate and is not automatically approved.
Phase 31I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31I does not approve BETA_READY.
Phase 31I does not approve public production readiness.
