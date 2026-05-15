# Phase 16F — EduGen Draft Workshop Connector Foundation

## 1. Phase statement

Phase 16F is the EduGen Draft Workshop Connector Foundation phase.

This phase implements **Scope A — connector foundation runtime**: a small,
bounded, optional companion connector for the future EduGen *Xưởng bản nháp*
(Draft Workshop). It adds:

- An optional `edugenServiceUrl` settings field, persisted through the
  existing lazy `settingsStorage.js` path with no schema migration.
- A reusable, pure connector module (`src/edugen/edugenConnector.js`)
  with URL normalization, health URL building, and a user-initiated
  `checkEdugenHealth` function that performs **only** a GET request to
  `<url>/health` with an injectable fetch impl and timeout.
- A Vietnamese-first Settings panel
  (`src/components/settings/EduGenDraftWorkshopPanel.jsx`) that lets the
  learner configure a service URL and run the health check on demand.
- A small Home.jsx Draft Workshop framing update that names EduGen as an
  *optional companion*, not bundled, with draft output that the learner
  must review before learning.

This phase explicitly does **not**:

- Call any AI endpoint (no `ai-process`, no provider client).
- Implement OCR or claim built-in OCR.
- Upload documents to the EduGen service (no document extraction runtime
  is wired up in Phase 16F).
- Bundle EduGen with Shime Quiz. EduGen remains a separate optional
  companion service run by the user.
- Activate or change FSRS scheduling. Active FSRS remains experimental,
  double-gated, default OFF, and internal/test-controlled.
- Implement cloud sync, account, auth, API keys, or BYOK.
- Modify scheduler files
  (`src/quiz/reviewSchedulerAdapter.js`, `src/quiz/fsrsWrapper.js`,
  `src/state/reviewScheduleStorage.js`).
- Add dependencies (no `package.json` / `package-lock.json` changes).
- Introduce IndexedDB migration, StorageAdapter, SyncAdapter, or event
  log runtime.
- Auto-import any EduGen output into the study queue.

The result is a safe foundation: a Vietnamese-first, claim-bounded UI
that lets a user configure where their optional EduGen Draft Workshop
service lives, and lets them check whether the service is reachable,
without committing Shime to any AI/OCR/cloud claims.

**Identity boundary (must stay true):**

- Phase 16F preserves the "no built-in AI" stance from Phase 16D/8D.
- Phase 16F preserves the "no OCR" stance — there is no built-in OCR.
- Phase 16F preserves the "no cloud sync" stance — there is no cloud
  sync runtime.
- Phase 16F is "local-first" — every core flow still works without an
  EduGen URL configured.
- EduGen output is draft only; review required before a card enters
  the learner's library or schedule.
- There is no automatic FSRS activation when the EduGen URL is set —
  active FSRS scheduling remains double-gated and default OFF.

---

## 2. Selected scope

**Scope A — connector foundation runtime** was selected.

The existing `settingsStorage.js` already supports lazy reads, no
write-on-read, write-once `fsrsEnabledAt` protection, and full
backup/restore round-trip via `importSettings()`. Adding a single string
field (`edugenServiceUrl`) into the existing normalization function is a
contained, low-risk change. No schema version bump and no migration is
required: missing field reads return the default empty string, malformed
input is normalized to the default, and existing backups continue to
round-trip with the new field treated as `''`.

Scope B (plan / UI copy only) was therefore unnecessary. The runtime
changes in this phase remain narrow and reversible.

---

## 3. Changed files

### New runtime modules
- `src/edugen/edugenConnector.js` — pure connector utilities.
- `src/components/settings/EduGenDraftWorkshopPanel.jsx` — Settings UI panel.

### Modified runtime files
- `src/state/settingsStorage.js` — added `edugenServiceUrl` default and
  normalization. No schema version bump. Backup/restore still routes
  through the existing `importSettings()` path; the new field defaults
  to `''` when absent in old backups.
- `src/routes/Settings.jsx` — mounts the new panel under the existing
  FSRS experimental settings panel.
- `src/routes/Home.jsx` — reframes the existing EduGen card on the public
  landing page as the Draft Workshop / Xưởng bản nháp companion. No new
  CTAs, no new routes.

### Styles
- `src/styles/global.css` — small additive style block for the EduGen
  Draft Workshop panel inputs/buttons/status. No new animations are
  introduced. The existing global `@media (prefers-reduced-motion: reduce)`
  block already covers any inherited transitions.

### Tests / docs / validator / CI
- `tests/unit/edugenDraftWorkshopConnector.test.js` — unit + static tests.
- `docs/phase16f-edugen-draft-workshop-connector-foundation.md` — this doc.
- `scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js`
  — static validator.
- `.github/workflows/e2e-smoke.yml` — registers the Phase 16F validator
  after the Phase 16E validator.

### Allowlist updates in prior validators
- Phase 16B/16C/16D/16E (and other strict-scope historical) validators
  have exact Phase 16F entries appended to their allowlists so the
  full static validator chain accepts the Phase 16F file set.

---

## 4. EduGen connector summary

The connector is a **pure function module** with no global side effects.
Its public surface is:

```js
normalizeEdugenServiceUrl(url)  // trim + reject non-http(s) + strip trailing slashes
buildEdugenHealthUrl(url)       // -> "<normalized-url>/health" or ''
isEdugenServiceConfigured(url)  // -> boolean
checkEdugenHealth(url, opts)    // -> { ok, status, code, message }
EDUGEN_HEALTH_STATUS            // status enum
EDUGEN_DRAFT_SOURCE_METADATA_SHAPE  // documented future shape (frozen)
```

`checkEdugenHealth` performs **exactly one** GET request to
`<url>/health`. It supports injection of `fetchImpl` (used by unit tests)
and a `timeoutMs` (default 5000ms) implemented via `AbortController`. It
never uploads documents, never reads files, and never calls any AI or
OCR endpoint. The endpoint name `ai-process` does not appear anywhere in
Shime runtime under this phase.

Health-check outcomes:

| Outcome                  | `status` value         |
|--------------------------|------------------------|
| Empty URL                | `not_configured`       |
| Non-http(s) / invalid    | `invalid_url`          |
| Service responds 2xx     | `reachable`            |
| Service responds non-OK  | `not_reachable`        |
| Abort / timeout          | `timeout`              |
| Network/other error      | `not_reachable`        |

The Settings panel maps each outcome to claim-safe Vietnamese copy
("Dịch vụ phản hồi", "Không phản hồi", "Chưa cấu hình", "Quá thời gian",
"URL không hợp lệ"), always paired with a reminder that the output is a
draft and that EduGen is an optional companion service the user runs
themselves.

---

## 5. Settings / health-check behavior

**Settings persistence**

- `edugenServiceUrl` is a new field on the canonical settings object.
- Default is `''` (empty string — explicitly *not* configured).
- `normalizeSettings()` rejects non-http(s) URLs, blank strings, and any
  unparseable input by mapping them to `''`.
- `getSettings()` continues to behave lazily: a missing storage key
  returns the default in memory and does not call `setItem` or
  `removeItem`. The new field inherits that guarantee.
- `updateSettings({ edugenServiceUrl })` writes only the merged settings
  through the existing normalization path. Unrelated fields
  (`fsrsExperimentalEnabled`, `fsrsEnabledAt`, `fsrsDesiredRetention`,
  etc.) are preserved unchanged.
- `importSettings()` handles new and legacy backups identically: an
  older backup that lacks `edugenServiceUrl` round-trips to the default
  empty string; a newer backup carrying a valid URL round-trips
  unchanged.
- The write-once `fsrsEnabledAt` guard in `importSettings()` is not
  affected.

**Health check**

- Triggered only by the user clicking "Kiểm tra kết nối". No background
  polling, no startup ping, no autorun on Settings mount.
- Performs a single GET to `<configured-url>/health` with a 5s timeout
  via `AbortController`.
- Uses `cache: 'no-store'` and no request body.
- Aborts (timeout) and network errors are caught; the UI never throws.

**Document upload**

- The Settings panel intentionally does **not** include any file picker
  or `FormData` upload control. Document extraction is out of scope.
  When and if a future phase adds document upload, it must reuse the
  existing `src/services/fileProcessorClient.js` boundary and respect
  the draft-before-trust contract.

---

## 6. Draft Workshop UX copy and guardrails

The new panel uses Vietnamese-first wording aligned with Phase 16A/16D:

- `Xưởng bản nháp EduGen` — section title.
- `URL dịch vụ EduGen (Tùy chọn)` — input label.
- `Shime không tự xử lý PDF/DOCX nếu không có dịch vụ EduGen đang chạy.`
- `Kết quả chỉ là bản nháp, bạn cần xem lại trước khi học.`
- Guardrail bullet list: optional companion, not bundled, review
  required, no automatic FSRS activation, no cloud sync, no account.
- English helper subtitles preserve historical claim-safe wording for
  validators that look for English reference strings.

Forbidden wording remains absent from the panel copy. The panel must
not frame EduGen as an AI generator, must not claim built-in AI
capability, must not assert that EduGen has been bundled or shipped
with Shime, must not claim cloud sync readiness or AI scheduling, and
must not guarantee mastery or guarantee that answers are correct.
Refer to Section 10 for the comprehensive forbidden-assertion list.

---

## 7. Source metadata future shape

Future EduGen draft items are expected to carry a `sourceMetadata`
object so the learner can audit where each draft card came from. Phase
16F documents the expected shape but does **not** persist it. No item
records, no library entries, and no backup payloads gain new required
fields in this phase.

Expected shape (documented):

```js
sourceMetadata: {
  sourceType: 'manual' | 'sample' | 'edugen-draft',
  sourceName: string,
  importedAt: string,        // ISO timestamp
  processor: 'edugen',
  reviewRequired: true
}
```

A frozen reference object `EDUGEN_DRAFT_SOURCE_METADATA_SHAPE` is
exported from the connector so future flows can compile against a
single source of truth without forking the shape.

---

## 8. Local-first trust boundary

Phase 16F preserves the seven local-first invariants established in
Phase 16B:

1. Full offline functionality — core study and Settings work without
   network access. The health check is opt-in.
2. No account required — the new field is just a URL string, with no
   credentials, API key, BYOK, or auth.
3. User owns local browser data — `edugenServiceUrl` lives in the same
   `shimeV2SettingsV1` localStorage key as other settings.
4. Backup/export/import remains the primary portability primitive —
   v2 backups continue to carry settings, and the new field round-trips
   without schema change.
5. Graceful degradation — invalid input, network failures, and timeouts
   all surface as calm status copy. No crash. No silent retry.
6. No silent data mutation — `getSettings()` is still lazy; only an
   explicit user save or import writes the new field.
7. No mandatory network or cloud dependency — the app works without an
   EduGen service configured. The Draft Workshop panel simply shows
   "Chưa cấu hình" and the rest of Shime is unaffected.

---

## 9. Backup / export / import relationship

- The v2 backup payload (`createV2BackupPayload()`) already serializes
  the `settings` object. With Phase 16F, that object includes
  `edugenServiceUrl` when present.
- Restoring an older backup (without `edugenServiceUrl`) is fully
  supported: `normalizeSettings()` returns `''` for the absent field and
  the existing FSRS write-once protections are unchanged.
- Restoring a Phase 16F backup on an older Shime build is also safe: the
  older normalizer ignores the unknown field; subsequent reads on the
  newer build re-introduce the default empty string.
- Backup remains the primary portability primitive. No sync was added.

---

## 10. Claim guardrails (must stay true)

Phase 16F preserves no built-in AI capability and no OCR capability. The
following categories of assertion remain permanently forbidden under
this phase and any future phase that does not ship explicit
implementation evidence:

- Asserting that Shime ships AI quiz generation as a built-in feature.
- Asserting that Shime ships OCR as a built-in feature.
- Asserting that EduGen has been bundled into Shime.
- Asserting that EduGen has been packaged into Shime out of the box.
- Asserting that cloud sync runtime has been deployed for users.
- Asserting that automatic sync between devices has been turned on.
- Asserting that AI selects which card the learner reviews next.
- Asserting that learning outcomes are guaranteed.
- Asserting that EduGen drafts are guaranteed to be correct.
- Asserting that a frontend-only deployment can process documents
  without the user running an EduGen service.
- Asserting that an API key, BYOK, or external provider credential is
  required or supported by Shime.

Active FSRS scheduling remains experimental, double-gated, default OFF,
and internal/test-controlled. No public rollout has been performed.

There is no automatic FSRS activation when the EduGen URL is set.

---

## 11. Validation evidence

- `scripts/validate-phase16f-edugen-draft-workshop-connector-foundation.js`
  — static scope, claim, workflow, and file guards specific to Phase 16F.
- `tests/unit/edugenDraftWorkshopConnector.test.js` — unit + static
  source assertions for connector, panel, Home, Settings, and doc.
- `.github/workflows/e2e-smoke.yml` — runs Phase 16F validator after
  Phase 16E.
- Full static validator chain run is expected to produce
  `FINAL_STATUS=0`.

### Manual / browser smoke

A manual browser smoke is expected on real browsers as part of the
handoff verification (see handoff). At minimum the smoke confirms:

- Settings page loads with the new EduGen Draft Workshop panel.
- Empty URL → "Chưa cấu hình" status; check button is disabled.
- Invalid URL on save → inline error message in Vietnamese.
- Valid URL pointing to an unreachable host → "Không phản hồi" status
  with calm wording (no crash, no console error storm).
- No `ai-process` request observed in DevTools Network tab.
- Existing Study Room flow still loads; no internal FSRS terms surfaced.

---

## 12. Forbidden / out-of-scope changes (confirmation)

| Restriction                                   | Confirmed |
|-----------------------------------------------|-----------|
| `package.json` unchanged                      | ✓ |
| `package-lock.json` unchanged                 | ✓ |
| `e2e/` unchanged                              | ✓ |
| `src/quiz/reviewSchedulerAdapter.js` unchanged| ✓ |
| `src/quiz/fsrsWrapper.js` unchanged           | ✓ |
| `src/state/reviewScheduleStorage.js` unchanged| ✓ |
| `src/quiz/dataBackup.js` unchanged            | ✓ |
| `src/state/v2BackupRestore.js` unchanged      | ✓ |
| No new dependencies                           | ✓ |
| No `ai-process` call from Shime runtime       | ✓ |
| No AI endpoint call                           | ✓ |
| No OCR implementation or OCR claim            | ✓ |
| No automatic FSRS activation                  | ✓ |
| No scheduling logic changes                   | ✓ |
| No FSRS behavior changes                      | ✓ |
| No IndexedDB / StorageAdapter / SyncAdapter   | ✓ |
| No event log runtime                          | ✓ |
| No sync / cloud / account / auth              | ✓ |
| No API key / BYOK                             | ✓ |
| No bundled EduGen server                      | ✓ |
| No backend/server code inside Shime           | ✓ |
| No automatic import to study queue            | ✓ |
| No new `ts-fsrs.next()` call sites            | ✓ |

---

## 13. Suggested next phase

**Phase 16G — EduGen Draft Review Import Flow.**

With the connector foundation in place, the next phase can introduce a
review-first import flow that pulls a draft from a *user-initiated* call
to the configured EduGen service, persists `sourceMetadata`, and routes
through the existing v2 draft preview + advisory quality review + user
confirmation pipeline before any cards enter the library.

Phase 16G must continue to respect:

- Draft-before-trust: nothing enters the library without per-card review.
- No automatic FSRS activation: new items follow the existing enrollment
  eligibility path.
- Source attribution: every imported card carries `sourceMetadata` from
  the connector.
- Local-first: import must remain user-initiated, with explicit consent
  copy and a backup recommendation for large imports.
- No AI / OCR claims expansion: EduGen continues to be framed as Draft
  Workshop, not a quiz generator.

If a runtime risk forces a fallback, Phase 16G may instead be:

**Phase 16G — EduGen Connector Runtime Follow-up** (docs + tests +
validator hardening only).
