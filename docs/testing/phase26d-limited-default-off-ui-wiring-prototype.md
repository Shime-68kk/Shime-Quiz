# Phase 26D — Limited Default-Off UI Wiring Prototype: Testing and Tester Run Pack

## Status token

```
PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER
PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES
PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM
PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE
PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER
```

## Scope

Phase 26D implements a limited hidden/default-off Backup Health developer/test harness prototype and prepares tester evidence.

Selected dev harness wiring file:

```
PHASE26D_SELECTED_DEV_HARNESS_WIRING_FILE: src/routes/routeConfig.js
```

The file `src/routes/routeConfig.js` is the single existing hidden developer/test harness wiring file. It already contains a `/dev/fsrs-ui-fixture` route with `showInNav: false`. Phase 26D adds one entry for `/dev/backup-health-harness` with `showInNav: false` following the same pattern.

## Implementation scope

Phase 26D creates:
- `src/components/dev/BackupHealthDevHarness.jsx` — hidden default-off React component
- `tests/unit/components/dev/BackupHealthDevHarness.test.jsx` — static analysis and pure function unit tests
- `docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md` — this file
- `docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md` — release summary
- `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js` — static validator

Phase 26D modifies:
- `src/routes/routeConfig.js` — adds one `/dev/backup-health-harness` entry with `showInNav: false`
- `.github/workflows/e2e-smoke.yml` — registers Phase 26D validator as current-phase CI gate

## Changed files

```
src/components/dev/BackupHealthDevHarness.jsx           (new)
tests/unit/components/dev/BackupHealthDevHarness.test.jsx  (new)
docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md  (new)
docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md  (new)
scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js  (new)
src/routes/routeConfig.js  (modified — one Phase 26D dev route entry added)
.github/workflows/e2e-smoke.yml  (modified — Phase 26D validator registered)
```

## Default-off gate proof

`BackupHealthDevHarness` returns `null` when:
- called with no props (`undefined`)
- called with null props
- called with empty props `{}`
- called with `{ enabled: false }`
- called with `{ enabled: true }` but no mode
- called with `{ enabled: true, mode: 'production' }` (rejected)
- called with `{ enabled: true, mode: 'live' }` (rejected)

`BackupHealthDevHarness` renders content only when:
- called with `{ enabled: true, mode: 'test', ... }`
- called with `{ enabled: true, mode: 'default-off', ... }`

The route `/dev/backup-health-harness` registered in `routeConfig.js` renders the component without props, which returns `null` — a completely blank page. No content is shown to any user by default.

## Hidden/dev/test harness proof

- `showInNav: false` on the route entry — never appears in navigation
- `navRoutes = routes.filter(route => route.showInNav)` excludes this route
- Route path uses `/dev/` prefix matching the existing `/dev/fsrs-ui-fixture` pattern
- Component file is in `src/components/dev/` — developer-only directory
- Component renders null with no props (default-off)
- No production-visible UI is added

## No production navigation proof

- `showInNav: false` in routeConfig.js entry
- No header, sidebar, or bottom nav reference added
- `navRoutes` array excludes this route
- No link or anchor to this route added anywhere
- No settings panel, library panel, or dashboard card references added

## No route/navigation/settings/library/dashboard broad rollout proof

- Only one dev route entry added in `routeConfig.js`
- No settings module modified
- No library module modified
- No dashboard module modified
- No navigation header/footer component modified
- Component does not import Settings, Library, or Dashboard

## No write proof

Component source contains no calls to:
- `localStorage.setItem`
- `localStorage.removeItem`
- `indexedDB`
- `fetch(`
- `XMLHttpRequest`
- `navigator.sendBeacon`
- Any backup/export/restore API

## No telemetry proof

Component source contains no calls to:
- `analytics(`
- `gtag(`
- Any telemetry/analytics import

## No backup/export/restore behavior change proof

- `BackupHealthDevHarness.jsx` does not import backup/export/restore modules
- Does not import `backupHealthIntegrationPrototype.js` directly (goes through Phase 25M view-model only)
- Does not import storage driver modules
- Does not call `exportBackup`, `importBackup`, or `restoreBackup`
- `src/routes/routeConfig.js` modification only adds a route entry; no backup behavior changes

## Vietnamese-first copy review

`BackupHealthDevHarness.jsx` contains the following Vietnamese-first copy:

- `[DEV/TEST ONLY — Bản sao lưu sức khỏe — Chỉ dùng cho kiểm tra]` — header label
- `Trạng thái:` — state label prefix
- `Chỉ dành cho nhà phát triển và kiểm thử viên. Không dùng trong sản xuất.` — developer-only disclaimer

All copy visible in the harness comes from the Phase 25M view-model `backupHealthUiPrototype.js`:
- `titleVi` — Vietnamese title per state
- `bodyVi` — Vietnamese body per state
- `actionLabelVi` — Vietnamese action label (if present)

Copy does not include:
- Guaranteed data-loss prevention claims
- Automatic backup claims
- Cloud sync claims
- Account recovery claims
- Platform backup preservation claims
- BETA_READY claims
- Broad backup reliability claims

## Unit test evidence

Tests are in `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`.

Test coverage:
- disabled by default with undefined/null/empty props
- disabled with enabled false
- disabled with no mode
- enabled only with test mode
- enabled only with default-off mode
- rejects production mode
- rejects live mode, staging mode, beta mode
- does not mutate inputs (frozen object test)
- exports PHASE26D_HARNESS_DISABLED_SENTINEL as non-empty string
- exports BACKUP_HEALTH_STATE from Phase 25M
- imports createBackupHealthUiModel from allowed path only
- does not import backupHealthIntegrationPrototype directly
- does not call localStorage, indexedDB, fetch, XMLHttpRequest, sendBeacon, analytics, gtag, Date.now, fs
- no href attribute in JSX
- no route registration pattern
- no showInNav, navRoutes, routeConfig references
- does not import Settings, Library, Dashboard
- no DashboardCard, SettingsCard, LibraryCard references
- no BETA_READY claim
- no guaranteed data-loss prevention claim
- no automatic backup claim
- no cloud sync claim
- no account recovery claim
- no platform backup preservation claim
- no broad backup reliability claim
- no production adapter-aware claim
- Vietnamese dev/test warning copy present
- Vietnamese backup state label present
- model.stateId, model.titleVi, model.bodyVi, model.tone, model.source, model.visible used
- data-testid attributes present
- routeConfig.js has /dev/backup-health-harness with showInNav: false
- /dev/fsrs-ui-fixture still present (unchanged)

## Validator evidence

Static validator: `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js`

Validator checks:
- Required files exist
- CI registers Phase 26D validator
- CI fetches origin/main before Phase 26D validator
- CI does not run Phase 24D-HF1 through Phase 26C validators as active blockers
- No full validate-*.js glob loop
- No continue-on-error: true
- Required tokens present in docs
- Selected dev harness wiring file path recorded
- Exact changed files within allowed set
- Double-dot diff (origin/main..HEAD)
- No generated artifacts changed
- No package/dependency changes
- No e2e/ADR files changed
- No production backup/export/restore modules changed
- No storage drivers changed
- No telemetry/analytics strings
- No sync/cloud/account/auth/backend files
- No broad route/navigation/settings/library/dashboard files (except the selected dev-only harness file)
- No prior Phase 26C/26B/26A/25N/25M/25K/25I files changed
- Component imports Phase 25M view-model only from allowed path
- Component does not use forbidden browser/write/network APIs
- Component does not contain href or nav item patterns
- Unit tests cover required scenarios
- Docs do not claim tester execution before tester evidence

## Tester run pack

**Status:** `PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER`

Tester execution has NOT been performed. This run pack is prepared for an external tester.

### Purpose

Verify that the Phase 26D hidden/default-off Backup Health developer/test harness:
1. Is completely invisible by default (no production navigation entry)
2. Renders null with no explicit opt-in
3. Shows calm Vietnamese-first content only when explicitly opted-in with test/default-off mode
4. Makes no writes to localStorage or IndexedDB
5. Makes no network calls
6. Has no links/hrefs to production navigation

### Local run command

```bash
cd /path/to/shimechamhoc-v2.0.0-rc1-project
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
npm run build
npm run dev
```

### Access instructions for hidden harness

The harness is registered at `/dev/backup-health-harness`. Navigate to this URL directly:
```
http://localhost:5173/dev/backup-health-harness
```

**Expected default behavior:** The page should appear blank (renders null with no props).

The harness is NOT accessible through any navigation menu, settings panel, library panel, or dashboard card.

### Tester verification steps

#### Step 1 — Default-off verification

1. Start the dev server: `npm run dev`
2. Navigate to `/dev/backup-health-harness`
3. **Expected:** Blank/empty page content. No Backup Health harness UI visible.
4. Open browser DevTools → check Elements tab: no `data-testid="backup-health-dev-harness"` element
5. **Pass criterion:** Page is blank. No harness content rendered.

#### Step 2 — Production navigation absence verification

1. Navigate to `/dashboard`, `/library`, `/settings`, `/study-room`
2. Check navigation menu (header/bottom nav)
3. **Expected:** No "Backup Health" or "BH Harness" link in any production navigation
4. **Pass criterion:** No backup health harness link in any production navigation surface

#### Step 3 — Explicit test/default-off opt-in verification

The component requires explicit prop injection to render (not available from the production URL without code intervention). This verification requires injecting props:

Option A — React DevTools:
1. Open browser DevTools → Components tab (React DevTools extension required)
2. Navigate to `/dev/backup-health-harness`
3. Find `BackupHealthDevHarness` in component tree
4. Inject props: `{ enabled: true, mode: 'test', currentTimeMs: 1716000000000, signalInput: { lastManualBackupMs: 1715913600000 } }`
5. **Expected:** Harness content visible with Vietnamese copy, state label, tone, and developer disclaimer

Option B — Source-level test (no browser required):
```bash
npm run test:unit -- tests/unit/components/dev/BackupHealthDevHarness.test.jsx
```
**Expected:** All tests pass.

#### Step 4 — No-write verification

1. Open browser DevTools → Application tab → Local Storage
2. Navigate to `/dev/backup-health-harness`
3. Watch for any new localStorage keys before and after navigation
4. **Pass criterion:** No new localStorage keys added by harness navigation

#### Step 5 — No backup/export/restore behavior change verification

1. Perform a normal backup export from `/settings` if available
2. Navigate to `/dev/backup-health-harness`
3. Return to `/settings` and verify backup export still works as before
4. **Pass criterion:** Backup/export/restore behavior unchanged

#### Step 6 — Vietnamese copy review

When harness is enabled with test/default-off mode:
- Check that all visible copy is Vietnamese-first
- Check that no English-only guarantee claims are present
- Check that developer disclaimer reads: `Chỉ dành cho nhà phát triển và kiểm thử viên. Không dùng trong sản xuất.`
- **Pass criterion:** Vietnamese-first copy confirmed; no guarantee/automatic/cloud claims

#### Step 7 — Keyboard/accessibility quick check

When harness is enabled and renders content:
- Tab through the harness content
- Check that no interactive elements (links, buttons) are present in the harness output
- **Pass criterion:** No interactive elements; harness is display-only

### Failure/anomaly table

| Check | Expected | Observed | Status |
|-------|----------|----------|--------|
| Default-off: blank page at /dev/backup-health-harness | Blank page | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |
| No nav link in production nav | No link visible | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |
| No new localStorage keys on navigation | No new keys | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |
| Vietnamese-first copy when enabled | Vi-first copy | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |
| No network calls | No network | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |
| No interactive links/hrefs | No links | NOT_RUN_PHASE26D_PREPARED_ONLY | PENDING_TESTER |

### Pass/fail criteria

**PASS** if all of:
- Page at `/dev/backup-health-harness` is blank with no explicit opt-in
- No backup health link in production navigation
- No localStorage writes on navigation
- Vietnamese-first copy confirmed when enabled
- No network calls observed

**FAIL** if any of:
- Harness content visible at production URL without explicit opt-in
- Backup health link appears in production navigation
- New localStorage keys written
- Non-Vietnamese copy present in harness output
- Network calls observed

### Rollback/removal note

If any FAIL is observed:
1. Remove `src/components/dev/BackupHealthDevHarness.jsx`
2. Remove `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`
3. Remove the Phase 26D entry from `src/routes/routeConfig.js`
4. No learner data migration or cleanup is required.

## Rollback/removal plan

Remove `src/components/dev/BackupHealthDevHarness.jsx`.
Remove `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`.
Remove the single Phase 26D hidden dev harness wiring reference, if added.
Remove `docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md`.
Remove `docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md`.
Remove `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js`.
Remove Phase 26D CI registration.
No learner data migration or cleanup is required because Phase 26D does not migrate data or change backup/export/restore behavior.

## Known limitations

- Tester evidence has NOT been collected. Tester must run the run pack above before any browser/user-facing behavior claim.
- The harness component renders null by default when accessed from the registered route URL (no props injected by router).
- The harness requires explicit prop injection via React DevTools or source-level test to render visible content from a browser.
- No keyboard/interactive functionality is implemented. Display-only.
- No persistent state. Harness output depends entirely on props passed at render time.

## What Phase 26D can claim

- A limited hidden/default-off Backup Health developer/test harness component exists in `src/components/dev/`
- The harness is wired to a `/dev/backup-health-harness` route with `showInNav: false`
- The harness returns null by default (default-off)
- Unit tests confirm default-off behavior, opt-in behavior, no write/network/telemetry APIs, no nav links, Vietnamese-first copy presence
- Static validator confirms scope boundaries

## What Phase 26D must not claim

Phase 26D does not approve production-visible Backup Health UI.
Phase 26D does not approve broad dashboard/settings/library rollout.
Phase 26D does not approve production adapter-aware backup/export/restore.
Phase 26D does not approve BETA_READY.
Tester evidence is required before any browser/user-facing behavior claim.

## Next recommended phase

Next recommended phase: Phase 26E — Phase 26D Tester Evidence Review and UI Wiring Re-Decision
Phase 26E is a separate evidence/re-decision gate and is not automatically approved.
Phase 26D does not approve production-visible Backup Health UI.
Phase 26D does not approve production adapter-aware backup/export/restore.
Phase 26D does not approve BETA_READY.
