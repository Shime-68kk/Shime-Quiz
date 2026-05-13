# Phase 14F-HF1 — Baseline Build/Test/Validator Recovery

## Summary

Phase 14F-HF1 is a narrow hotfix that restores baseline build, test, and validator health on
`origin/main` after two pre-existing failures were identified that would block Phase 14G CI green.

This phase does **not** change Study Room, does **not** change Dashboard, does **not** change
reviewSchedulerAdapter, does **not** change FSRS scheduling behavior, does **not** add user-facing
FSRS functionality. No new-card enrollment runtime is added.

Scope: package.json, package-lock.json, scope: validate-v2-release-hardening.js, and
validator allowlist compatibility entries.

---

## Failure 1 — Build Failure

**Symptom:** `npm run build` threw `TypeError: callablePlugin.getOrder is not a function`.

**Root cause:** `package.json` declared `"vite": "latest"` which resolved to vite **8.0.10** in
`package-lock.json`. Vite 8.0.x switched its internal bundler from Rollup to **rolldown
1.0.0-rc.17** (still an RC release). The `@vitejs/plugin-react` **6.0.1** plugin was incompatible
with rolldown's new plugin API: rolldown called `callablePlugin.getOrder()` which is not
implemented in the plugin. There is no fix within vite 8.x for this combination.

**Fix:** Pin vite to **7.3.3** (latest stable pre-rolldown release) and `@vitejs/plugin-react` to
**5.0.4** (compatible with vite 7.x). `vitest ^4.1.5` declares peer dep
`"vite": "^6.0.0 || ^7.0.0 || ^8.0.0"` so it works unchanged with vite 7.3.3.

`ts-fsrs` remains exactly `5.3.3` (unchanged). No rolldown-specific packages are added.

The `package.json` change is strictly limited to the two version pins above.

---

## Failure 2 — Validator Failure

**Symptom:** `node scripts/validate-v2-release-hardening.js` threw:
`Error: first history record should save`

**Root cause:** `CustomEvent` is not available as a bare global in **Node.js 18** without the
`--experimental-global-customevent` flag. The validator set up a mock window with
`window.CustomEvent = globalThis.CustomEvent`, but `globalThis.CustomEvent` was `undefined` in
Node.js 18.19.1. When `writeRecords()` called `emitHistoryUpdated()` which executed
`new CustomEvent(...)` as a direct global reference, a `ReferenceError` was thrown. This was
silently caught by the `try/catch` in `writeRecords()`, causing it to return
`{ ok: false, error: 'storage_write_failed' }`, so `saveStudyHistoryRecord` returned
`{ saved: false }`.

**Fix:** Add a minimal `CustomEvent` polyfill to `globalThis` in `validate-v2-release-hardening.js`
before the dynamic imports. This matches the pattern already used in the vitest unit tests
(`withMockWindow` helper in `fsrsPersistenceHarness.test.js`). The fix is limited to the validator
script; no product runtime code is changed.

---

## Scope Control

Phase 14F-HF1 does NOT:
- Change Study Room UI, Dashboard UI, or any route component
- Change `reviewSchedulerAdapter.js`
- Change `fsrsWrapper.js`, `reviewScheduleStorage.js`, `v2BackupRestore.js`, `localStorageSync.js`
- Add user-facing FSRS toggle, ratings UI, or enrollment runtime
- Add new-card enrollment, production FSRS scheduling, or migration logic
- Add any dependency that references rolldown or native bindings

---

## Invariants Preserved

- `ts-fsrs` remains exact-pinned at `5.3.3`
- No `@open-spaced-repetition/binding` native binding is added
- No internal registry terms added to package files
- Phase 14B–14F validators continue to pass
- Full static validator chain achieves `FINAL_STATUS=0`
- `npm run build` produces a valid Vite 7 production bundle
- `npm run test:unit` passes all 55 unit tests

---

## Changed Files

| File | Change |
|------|--------|
| `package.json` | Pin `"vite": "7.3.3"` and `"@vitejs/plugin-react": "5.0.4"` |
| `package-lock.json` | Regenerated |
| `scripts/validate-v2-release-hardening.js` | Add `globalThis.CustomEvent` polyfill |
| `docs/phase14f-hf1-baseline-validation-recovery.md` | This file (HF1 doc) |
| `scripts/validate-phase14f-hf1-baseline-validation-recovery.js` | HF1 static validator |
| `.github/workflows/e2e-smoke.yml` | Add HF1 validator step |
| Various `scripts/validate-*.js` | Add HF1 files to allowlists for forward compatibility |
