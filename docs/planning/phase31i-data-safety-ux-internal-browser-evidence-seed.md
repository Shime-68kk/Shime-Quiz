# Phase 31I — Data Safety UX Internal Browser Evidence Seed

## Status token

```text
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 31I is a separate browser evidence gate for the Phase 31G default-off
internal visibility implementation. Phase 31I is not automatically approved by
Phase 31H.

Phase 31I collects manual browser evidence to confirm:

1. Default-off behavior in a production-like build (no env flag set).
2. Ordinary-user production-hidden status (prototype not visible without flag).
3. Internal-visible behavior with `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1`
   in a dev/test build.

Phase 31I does not automatically approve ordinary-user visibility, BETA_READY,
or any production readiness beyond `LIMITED_BETA_CANDIDATE`.

## Inputs from Phase 31H

- `PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION`
- Static evidence confirms default-off, narrow env acceptance, no storage/network APIs,
  Settings.jsx-only integration, Phase 31C guard preserved
- `PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED`
- All browser-confirmed claims deferred to Phase 31I

## Browser evidence constraints

Phase 31I browser evidence must be collected under these constraints:

1. Evidence must be captured manually by a human tester (internal/dev only).
2. Production build test: build with no `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY`
   flag. Open Settings page. Confirm Data Safety section is absent.
3. Internal build test: build or run dev server with
   `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1`. Open Settings page.
   Confirm Data Safety section is present and renders prototype UI.
4. Rollback test (optional): revert Settings.jsx to pre-Phase-31G config.
   Confirm Data Safety section is absent regardless of env flag.
5. No automated browser injection of the env flag on behalf of ordinary users.
6. Evidence must be recorded honestly. Do not fabricate browser evidence.

## Required browser checks

| Check | Steps | Expected result |
|---|---|---|
| Default-off in production build | Build with no `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY`; open /settings | Data Safety section absent |
| Ordinary-user production hidden | Load the app as a regular user; open /settings | Data Safety section absent |
| Internal flag enables prototype (dev build) | Set `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1`; run dev server; open /settings | Data Safety section visible |
| Internal flag with `true` value | Set `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=true`; run dev server; open /settings | Data Safety section visible |
| Invalid flag does not enable prototype | Set `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=yes`; run dev server; open /settings | Data Safety section absent |
| No browser storage writes on render | Open DevTools → Application; render prototype; check localStorage/sessionStorage/IndexedDB | No new entries written |
| No network calls on render | Open DevTools → Network; render prototype | No fetch/XHR/WebSocket calls from prototype |
| Rollback hides prototype | Revert Settings.jsx config; build/run; open /settings | Data Safety section absent |

## Required static checks

These static checks supplement browser evidence and must also pass:

```bash
grep -RIn "localStorage\|sessionStorage\|indexedDB\|cookie\|fetch\|XMLHttpRequest\|WebSocket\|sendBeacon" \
  src/features/dataSafety src/routes/Settings.jsx 2>/dev/null || true

grep -RIn "backup\|restore\|export\|import\|storage\|sync\|cloud\|backend\|account\|auth" \
  src/features/dataSafety src/routes/Settings.jsx 2>/dev/null || true
```

All results must be in guardrail comments or negative assertions only.

## Required rollback checks

Before Phase 31I is closed:

1. Confirm `createDataSafetyInternalVisibilityConfig` returns `{ enabled: false }`
   for an env object with no flag.
2. Confirm that reverting Settings.jsx line 82–84 to `{}` plus removing the helper
   import is sufficient to hide the prototype in all builds.
3. Confirm no data migration or storage cleanup is needed for rollback.

## Decision options

Phase 31I must result in one of the following decisions:

```text
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: HOLD_INTERNAL_BROWSER_EVIDENCE
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: NEEDS_MORE_EVIDENCE
PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE
```

`HOLD_INTERNAL_BROWSER_EVIDENCE`: evidence contradicts default-off claims or reveals
unexpected behavior. Do not proceed until investigated.

`NEEDS_MORE_EVIDENCE`: partial evidence collected but browser checks incomplete.
Continue collecting before deciding.

`PASS_INTERNAL_BROWSER_EVIDENCE`: all required browser checks completed and pass.
Default-off and internal-visible behaviors confirmed in browser.

Phase 31I is a separate browser evidence gate and is not automatically approved.

## Forbidden default approvals

Phase 31I must not approve any of the following without explicit evidence and a
separate gate:

- BETA_READY
- Public production readiness
- Guaranteed data-loss prevention
- Restore execution or production restore rehearsal
- Real learner data restore rehearsal
- Runtime backup/export/restore behavior changes
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration
- Sync/cloud/account/auth/backend
- Telemetry/analytics
- Built-in AI/OCR/API-key/BYOK behavior
- BYOC/WebDAV/P2P/device-transfer implementation
- Limited settings visibility to ordinary users

`LIMITED_BETA_CANDIDATE` remains the highest approved readiness status entering
Phase 31I. Phase 31I may confirm browser-visible default-off behavior but does
not by itself approve ordinary-user visibility or broader readiness.

## Recommended next step

Phase 31I should begin with the production build browser test (default-off
confirmation). If default-off is browser-confirmed, proceed to the internal dev
build test. Record all results honestly. Do not fabricate browser evidence.

Phase 31I evidence should be recorded in:

```text
docs/testing/phase31i-data-safety-ux-internal-browser-evidence.md
```

If browser evidence reveals unexpected behavior (prototype visible in production
build, unexpected storage writes, unexpected network calls), issue decision
`HOLD_INTERNAL_BROWSER_EVIDENCE` and investigate before proceeding.
