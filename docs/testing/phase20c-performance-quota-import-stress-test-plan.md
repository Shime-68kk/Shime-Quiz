# Phase 20C — Performance / Quota / Import Stress Test Plan

## Purpose

This document is the Phase 20C performance, quota, and import stress-test execution
guide. It translates the Phase 20C ADR decisions into concrete test data sets, scenario
steps, measurement guidelines, and observer instructions. It is read by the testing
coordinator and shared with stress testers before each session begins.

This plan is docs-only. It does not implement any runtime code. It does not add
telemetry, analytics, or user accounts. It does not modify storage behavior, FSRS
behavior, import parser behavior, or backup/export/restore behavior.

---

## Test environment assumptions

Phase 20C stress testing operates under the following environment assumptions:

- The app is the current production build (localhost or deployed static site).
- No runtime stress fixture, instrumentation, or monitoring agent is installed.
- All measurement is manual and subjective unless otherwise stated.
- Testing uses generated or duplicate data only. No irreplaceable study data is used
  without a prior backup.
- Browser developer tools (console, network, storage inspector) may be used for
  diagnostic observation but do not constitute automated telemetry.
- Testing is performed on at least one desktop browser (Chrome, Firefox, or Edge)
  and, where possible, on at least one mobile device or mobile viewport.
- PWA scenarios require the app to be installed as a PWA or accessed via a PWA-capable
  browser.

---

## Test data sets

### Small library set (S)

- 10–20 cards.
- Simple text front/back content.
- No FSRS metadata.
- Available as JSON export from a fresh test library.
- Purpose: establish safe baseline; verify no performance issues at small scale.

### Medium library set (M)

- 50–100 cards.
- Mixed text content, some longer fields.
- May include review schedule metadata (due dates, intervals).
- Available as JSON and CSV.
- Purpose: verify import correctness and storage usage at a realistic mid-scale.

### Large library set (L)

- 200–500 cards.
- Rich text content, longer fields.
- Full review schedule metadata and FSRS metadata if applicable.
- Available as JSON.
- Expected localStorage size: 1–5 MB depending on content richness.
- Purpose: approach quota risk boundary; stress test startup, import, and backup/restore.

### Generated/duplicate data rule

All test data sets must use generated or duplicate content. Do not use irreplaceable
study data. Synthetic data that mimics the structure of real study cards (short
Vietnamese/English terms, sentences) is acceptable.

---

## Performance scenarios

### P1 — App startup with small library

**Data set:** Small library set (S)

**Steps:**
1. Open the app in a fresh browser tab (or incognito window) with the small library
   preloaded in localStorage.
2. Observe app startup from navigation to first meaningful content display.
3. Record subjective responsiveness: immediate / slight delay / noticeable / unacceptable.
4. Check browser console for errors.

**Pass criteria:** Startup feels immediate or at most a slight delay. No console errors.

**Fail criteria:** Startup is noticeable or unacceptable. Console errors present.

---

### P2 — App startup with large library

**Data set:** Large library set (L)

**Steps:**
1. Open the app in a fresh browser tab (or incognito window) with the large library
   preloaded in localStorage.
2. Observe app startup from navigation to first meaningful content display.
3. Record subjective responsiveness: immediate / slight delay / noticeable / unacceptable.
4. Check browser console for errors.
5. Note any visible loading delay or layout flash.

**Pass criteria:** Startup is at most noticeable (not unacceptable). No console errors.

**Fail criteria:** Startup is unacceptable. Console errors present. Visible blank flash
persists for more than ~1 second.

---

### P3 — Dashboard today plan with large library

**Data set:** Large library set (L) with due cards

**Steps:**
1. Preload the large library into localStorage.
2. Set some cards as due (manually set due dates to today or past).
3. Open the Dashboard and observe the today plan card loading.
4. Record subjective responsiveness and any visible delay in the due-card count display.
5. Check browser console for errors.

**Pass criteria:** Dashboard today plan loads with at most a slight delay. Due-card count
is accurate. No console errors.

**Fail criteria:** Dashboard today plan is visibly slow or inaccurate. Console errors
present.

---

### P4 — Study Room session with due cards

**Data set:** Large library set (L) with 50+ due cards

**Steps:**
1. Preload the large library into localStorage with 50+ cards set as due.
2. Navigate to Study Room and begin a study session.
3. Observe session startup time and card-transition responsiveness.
4. Complete 10 card transitions and record subjective responsiveness for each.
5. Check browser console for errors.

**Pass criteria:** Study Room session starts with at most a slight delay. Card transitions
feel immediate. No console errors.

**Fail criteria:** Session startup is noticeable or unacceptable. Card transitions feel
slow. Console errors present.

---

## Storage quota scenarios

### Q1 — Storage quota estimate with small library

**Data set:** Small library set (S)

**Steps:**
1. Open browser developer tools → Application → Storage.
2. Note the current localStorage usage in bytes/KB.
3. Import the small library set if not already loaded.
4. Note the new localStorage usage.
5. Estimate headroom remaining before quota limit.

**Record:** localStorage size before and after, estimated quota headroom.

**Pass criteria:** Small library fits well within quota. No quota warning triggered.

---

### Q2 — Storage quota estimate with large library

**Data set:** Large library set (L)

**Steps:**
1. Open browser developer tools → Application → Storage.
2. Note the current localStorage usage.
3. Import the large library set.
4. Note the new localStorage usage.
5. Estimate headroom remaining before quota limit.
6. Note whether any quota warning is triggered.

**Record:** localStorage size before and after, estimated quota headroom, any quota
warning triggered.

**Pass criteria:** Quota usage is measurable and estimate is reasonable. If near quota
limit, quota warning appears correctly.

---

### Q3 — Large import warning visibility

**Data set:** Large library set (L) at or near quota warning threshold

**Steps:**
1. Prepare a large library JSON file (200–500 cards).
2. Navigate to the import flow.
3. Initiate the import.
4. Observe whether a large import warning or storage quota warning appears.
5. Read the warning text and assess clarity.
6. Note whether the warning is actionable (e.g., does it tell the tester what to do?).

**Record:** Whether warning appeared, warning text, tester assessment of clarity.

**Pass criteria:** Large import warning appears at the correct threshold. Warning text
is clear and actionable.

**Fail criteria:** Warning does not appear for a risky import size. Warning text is
unclear or missing. This is a Phase 20D hold signal.

---

## Import scenarios

### I1 — Import small JSON

**Data set:** Small library set (S) as JSON file

**Steps:**
1. Create a fresh test environment (empty library or isolated test profile).
2. Make a backup before the import.
3. Navigate to the import flow.
4. Import the small JSON file.
5. Verify the import completed correctly: card count matches expected, content is correct.
6. Check browser console for errors.

**Record:** Import outcome (success/failure), card count after import, console errors.

**Pass criteria:** Import completes successfully. Card count is correct. No console errors.

---

### I2 — Import larger JSON

**Data set:** Large library set (L) as JSON file

**Steps:**
1. Create a fresh test environment.
2. Make a backup before the import.
3. Navigate to the import flow.
4. Import the large JSON file.
5. Observe import duration (subjective: immediate / slight delay / noticeable / long).
6. Verify card count after import matches expected.
7. Check browser console for errors.
8. Note whether any large import warning or quota warning appeared.

**Record:** Import outcome, import duration (subjective), card count, console errors,
any warnings triggered.

**Pass criteria:** Import completes successfully. Card count is correct. If near quota,
warning appeared. No console errors.

**Fail criteria:** Import fails, produces incorrect card count, or triggers console
errors. Warning missing for quota-risky size.

---

### I3 — Import CSV

**Data set:** Medium library set (M) as CSV file

**Steps:**
1. Create a fresh test environment.
2. Make a backup before the import.
3. Navigate to the import flow.
4. Import the CSV file.
5. Verify the import completed correctly: card count matches expected, content is correct.
6. Check browser console for errors.

**Record:** Import outcome, card count after import, any CSV-specific parsing issues,
console errors.

**Pass criteria:** CSV import completes successfully. Card count is correct. No console
errors.

---

### I4 — Import text/markdown

**Data set:** Medium library set (M) as text/markdown file

**Steps:**
1. Create a fresh test environment.
2. Make a backup before the import.
3. Navigate to the import flow.
4. Import the text/markdown file.
5. Verify the import completed correctly.
6. Check browser console for errors.

**Record:** Import outcome, card count after import, any parsing boundary behaviors
observed, console errors.

**Pass criteria:** Text/markdown import completes or fails with a clear error message.
No silent partial imports. No console errors.

---

### I5 — EduGen draft review import boundary

**Data set:** EduGen-generated draft content (realistic volume)

**Steps:**
1. Use the EduGen draft review flow to generate a draft with 10–20 items.
2. Observe the draft/review/import sequence.
3. Verify that unreviewed draft content is not silently added to the library.
4. Complete the review and import.
5. Verify card count and content after import.
6. Check browser console for errors.

**Record:** Whether unreviewed content was blocked, card count after import, console
errors, any EduGen-specific behavior observations.

**Pass criteria:** EduGen draft review import boundary is enforced. Unreviewed content
is not silently added. Card count after import matches reviewed items. No console errors.

**Fail criteria:** Unreviewed content enters the library without review. This is a
Phase 20D hold signal.

---

## Backup and restore scenarios

### B1 — Backup before risky action

**Steps:**
1. Before any large import, restore, or repeated backup/restore rehearsal, navigate to
   the backup/export flow.
2. Create a backup export.
3. Verify the backup file is created and downloadable.
4. Open the backup file in a text editor and verify it is readable JSON with the expected
   card count.

**Record:** Backup outcome (success/failure), backup file size (approx.), whether file
is readable JSON with correct card count.

**Pass criteria:** Backup file is created, downloadable, readable as JSON, with correct
card count.

---

### B2 — Restore from backup

**Steps:**
1. Ensure a backup file exists from step B1.
2. Navigate to the restore flow.
3. Read the restore warning carefully before proceeding.
4. Complete the restore from the backup file.
5. Verify item count after restore matches the backup card count.
6. Verify review schedule state is preserved.
7. Check browser console for errors.

**Record:** Restore outcome (success/failure), item count after restore, review schedule
state, console errors, whether tester understood restore may overwrite current data.

**Pass criteria:** Restore completes successfully. Item count after restore matches
backup. Review schedule state is correct. No console errors.

**Fail criteria:** Restore fails, produces incorrect item count, or corrupts review
schedule state.

---

### B3 — Repeated backup/restore rehearsal

**Data set:** Large library set (L)

**Steps:**
1. Start with the large library loaded.
2. Record initial item count and review schedule state.
3. Create backup 1. Verify file integrity.
4. Import a small library set (to change the library state).
5. Restore from backup 1. Verify item count after restore matches original.
6. Create backup 2. Verify file integrity.
7. Restore from backup 2. Verify item count after restore.
8. Create backup 3. Verify file integrity.
9. Restore from backup 3. Verify item count after restore.
10. Check browser console for errors after each cycle.

**Record:** Item count after each restore cycle, review schedule count after each
restore, console errors at each step, any discrepancies between cycles.

**Pass criteria:** All three backup/restore cycles produce correct item counts and
review schedule states. No console errors. No discrepancies between cycles.

**Fail criteria:** Any restore cycle produces incorrect item count, incorrect review
schedule state, or console errors. Any discrepancy between cycles is a Phase 20D hold
signal.

---

## Manual transfer scenarios

### T1 — Manual export/import transfer

**Data set:** Medium or large library set

**Steps:**
1. Export the library from a source browser profile (or source device).
2. Transfer the export file manually (download to local filesystem, then use file picker
   on the target profile or device).
3. Import the file in the target browser profile (or target device).
4. Verify card count and review schedule state match the source.
5. Confirm the tester understands this is not sync and the two profiles/devices now have
   separate copies.

**Record:** Transfer outcome (success/failure), card count match, review schedule state
match, tester's understanding of manual vs. sync.

**Pass criteria:** Transfer completes correctly. Card count and review schedule state
match. Tester understands the transfer is manual and not sync.

---

## FSRS and review schedule scenarios

### F1 — FSRS active/off/default boundary

**Steps:**
1. Check the current FSRS toggle state (on/off/default).
2. With FSRS at default (off), study a small set of cards and verify due-card count.
3. If FSRS is available for internal testing, toggle to FSRS active and verify
   due-card count is updated correctly.
4. Toggle back to default and verify due-card count.
5. Check browser console for errors during toggling.

**Record:** FSRS toggle state, due-card count at each state, console errors.

**Pass criteria:** Due-card count is accurate at each FSRS state. No console errors.
FSRS boundary is clear and non-confusing.

---

### F2 — Review schedule due-count accuracy

**Data set:** Large library set (L) with defined due dates

**Steps:**
1. Preload the large library with a defined set of due cards.
2. Verify the due-card count on the Dashboard matches the expected count.
3. Complete a backup/restore cycle.
4. Verify the due-card count after restore matches the count before restore.
5. Complete a manual export/import transfer.
6. Verify the due-card count after import matches the expected count.

**Record:** Due-card count before and after backup/restore, before and after manual
transfer, any discrepancies.

**Pass criteria:** Due-card count is accurate and consistent across backup/restore and
manual transfer. No discrepancies.

**Fail criteria:** Due-card count is incorrect or inconsistent. This is a Phase 20D
hold signal.

---

## Mobile/PWA scenarios

### M1 — Mobile viewport

**Steps:**
1. Open the app in a mobile viewport (physical device or browser developer tools
   mobile emulation, 375px or 390px width).
2. Complete an app startup with the large library set.
3. Complete a small import (small JSON set) on mobile.
4. Complete a backup creation on mobile.
5. Observe layout usability for each flow.
6. Record subjective responsiveness and any layout issues.

**Record:** Mobile layout usability rating for each flow, subjective responsiveness,
any visible layout breakage or overflow.

**Pass criteria:** Mobile layout is usable for all tested flows. No severe layout
breakage. Responsiveness is acceptable.

---

### M2 — PWA/service worker cache boundary

**Steps:**
1. Install the app as a PWA (if available) or use a service-worker-enabled browser.
2. Load the app and verify it displays the current library.
3. Hard-reload the app (Ctrl+Shift+R or equivalent to bypass cache).
4. Verify the library data is still correct after a hard reload.
5. Clear the service worker cache via developer tools and reload.
6. Verify the app re-fetches correctly and shows the correct library state.

**Record:** Whether PWA/service worker caching causes any confusion (stale data, wrong
card counts), outcome of cache-clear reload.

**Pass criteria:** App behaves correctly after hard reload and cache clear. No stale
data displayed. Card counts are correct.

**Fail criteria:** PWA/cache confusion occurs (stale cards shown, incorrect counts after
reload). This is a Phase 20D hold signal.

---

## Measurement notes

All Phase 20C measurement is manual and subjective. There is no automated performance
instrumentation.

### Subjective responsiveness scale

- **Immediate:** No perceptible delay. Operation completes before the tester can notice
  a gap.
- **Slight delay:** A brief but acceptable delay. Tester notices a short pause but finds
  it acceptable.
- **Noticeable:** A delay that the tester notices and finds somewhat uncomfortable. Not
  blocking, but suboptimal.
- **Unacceptable:** A delay that the tester finds unacceptable or that interferes with
  task completion.

### No telemetry / no analytics collection

Phase 20C does not add telemetry or analytics. All measurement results are recorded
manually by testers in external notes. No performance data is sent to any server. No
usage data is collected inside the app.

### Browser console errors

Testers must check the browser developer console (F12 → Console) for errors during
each scenario. Any console errors must be recorded as part of scenario outcomes.

---

## What to record

For each stress testing scenario, record:

- Scenario ID and name.
- Date and tester identifier (internal label only, not stored in app code).
- Subjective responsiveness rating (immediate / slight delay / noticeable / unacceptable).
- Any visible delay, layout flash, or blank screen observed.
- Browser console errors (copy or note the error message).
- Import outcome (success/failure/partial).
- Import warnings (appeared / did not appear / unclear).
- Backup file creation (success/failure, file readable, correct card count).
- Restore success/failure and item count after restore.
- Review schedule count after restore.
- Quota warning visibility (appeared / did not appear / unclear).
- Mobile layout usability (usable / layout issues / broken).
- PWA/cache confusion (none / some confusion / significant confusion).
- Tester confidence before risky actions (1–5 scale, qualitative notes).
- Any stop conditions triggered.

---

## What not to record

Do not record:

- Tester names, emails, or any personal identifying information in app code or
  repository.
- Study card content from testers (unless synthetic test data is used, which is fine).
- Review schedule data or FSRS metadata from testers' real libraries.
- Backup file contents from testers' real libraries (unless synthetic).
- localStorage contents from testers' real libraries.
- Account credentials, cloud credentials, or any authentication data.
- Any performance timing numbers as if they represent objective benchmarks — all timing
  is subjective and contextual.

---

## Stop conditions during stress testing

Stop the current scenario and record the event if:

- An import operation produces an incorrect card count or causes data loss.
- A restore operation produces an incorrect item count or corrupts review schedule state.
- A backup file is corrupted, unreadable, or contains an incorrect card count.
- A storage quota limit is hit unexpectedly during a scenario.
- The app becomes non-functional during or after an operation.
- Browser console errors indicate a critical failure.
- The large import warning is missing for a risky import size.
- EduGen draft review import boundary allows unreviewed content into the library.
- PWA/service worker cache causes incorrect data display.
- Review schedule due-count accuracy fails after import, backup, or restore.
- Repeated backup/restore cycles produce inconsistent item counts or review schedule
  states.

Stop all stress testing and escalate to Phase 20D hold if:

- App startup is unacceptable with the large library on any tested browser/device.
- Large import warning is missing or unclear for any risky import size.
- Any backup/restore cycle produces incorrect item counts.
- Mobile layout is unusable for any performance-sensitive flow.
- Review schedule due-count accuracy fails on more than one scenario.
- EduGen draft review import boundary fails to block unreviewed content.

---

## Phase 20D evidence handoff

At the conclusion of Phase 20C stress testing, prepare a Phase 20D evidence summary:

- Total number of stress test scenarios completed.
- List of scenarios tested with outcome (pass/fail/stop).
- Subjective responsiveness ratings summary.
- List of any stop conditions triggered and their resolutions.
- List of any Phase 20D hold signals observed.
- Recommendation: beta-ready, hold for specific issues, or conditional beta with known
  performance/quota limitations documented.

This evidence handoff document is an external artifact (not app code, not committed to
the repository). It is provided to the Phase 20D decision gate as human-readable notes.

Phase 20D consumes Phase 20A stabilization audit evidence, Phase 20B real user testing
feedback, and Phase 20C performance/quota/import stress-test results.

Phase 20D is the final gate before any broader beta announcement. Phase 20D decides
beta-ready or hold based on Phase 20A–20C evidence.
