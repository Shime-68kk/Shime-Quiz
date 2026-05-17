# Phase 20B — Real User Testing Plan

## Purpose

This document is the Phase 20B real user testing execution guide. It translates the
Phase 20B ADR decisions into concrete testing steps, session structure, and observer
guidelines. It is read by the testing coordinator and shared with testers before each
session begins.

This plan is docs-only. It does not implement any runtime code. It does not add
telemetry, analytics, or user accounts. It does not modify storage behavior, FSRS
behavior, or backup/export/restore behavior.

---

## Who should test

Phase 20B testing is appropriate for:

- Trusted team members or close collaborators who understand this is a beta product.
- Testers who are comfortable with the concept of localStorage-only data storage.
- Testers who can be explicitly briefed on the no-sync, no-cloud baseline before testing.
- Vietnamese-speaking testers who can evaluate Vietnamese-first trust copy.
- Testers who can follow the pre-test safety checklist without needing prompting.
- Testers who can give qualitative feedback about flows, copy, and trust signals.

---

## Who should not test yet

Phase 20B testing is not appropriate for:

- General public users who expect production stability guarantees.
- Users with irreplaceable study libraries who have not made a backup.
- Users who have been told sync or cloud backup is available.
- Users who expect multi-device sync to work out of the box.
- Users who have not been briefed on the beta nature of the product.
- Users who are not comfortable with the concept of manual data management.

---

## Pre-test safety checklist

Complete this checklist with each tester before any testing session begins. Do not start
testing until all items are confirmed.

- [ ] Tester has been told this is a beta product and data safety is not guaranteed.
- [ ] Tester has been told that all data is stored locally on their device (localStorage),
      not on any Shime server.
- [ ] Tester has been told there is no cloud sync and no automatic backup.
- [ ] Tester has been told that backup is not sync; a backup is a manual snapshot.
- [ ] Tester has been told that restore may overwrite current data.
- [ ] Tester has been told that manual transfer is not sync.
- [ ] Tester has been told to use test/duplicate data if possible.
- [ ] Tester has made a backup export if using real study data, or has confirmed they
      are using test/duplicate data and accept the risk.
- [ ] Tester has read (or been briefed on) the Vietnamese-first trust statement if
      they are a Vietnamese speaker.
- [ ] Tester understands that FSRS is experimental and not publicly available for opt-in.
- [ ] Tester understands that FSRS data does not sync between devices.
- [ ] Tester knows how to reach the testing coordinator if something goes wrong.

---

## Test dataset guidance

To minimize data loss risk during Phase 20B testing:

1. Create a dedicated test library for Phase 20B testing. Use synthetic or duplicate
   cards that do not represent real study data you cannot afford to lose.

2. Export a backup before each test session. Label the backup file with the date and
   session number (e.g., `shime-backup-phase20b-session1-2026-05-18.json`).

3. Keep the backup file in a safe location outside the browser storage (download folder,
   external drive, email attachment to yourself).

4. If you must use your real study library, confirm you have made a fresh backup before
   any risky operation (import, restore, large-data change).

5. Do not rely on browser storage as a backup. localStorage can be cleared by browser
   events, device resets, or storage quota limits.

---

## Core user flows to observe

### First-run onboarding

**Goal:** Observe first impressions and trust signal landing.

Steps:
1. Open the app in a fresh browser profile (or private/incognito window) with no prior
   data.
2. Observe the onboarding flow from start to finish without prompting.
3. Note: Does the tester understand data is local? Does the tester ask about sync or
   cloud? Does the no-account message land clearly?
4. After onboarding, ask: "What do you understand about where your data is stored?"

Observe:
- Does the tester understand data is local without being told?
- Does any element of the onboarding imply cloud sync or account?
- Is the Vietnamese trust copy (if shown) understood correctly?

### Create/import small library

**Goal:** Observe the import flow for a small dataset.

Steps:
1. Ask the tester to create a small study library (5–10 cards) or import a small existing
   JSON/CSV file.
2. Observe the import flow without intervention.
3. After import, ask: "Where do you think this data is stored?"
4. Ask: "What happens to this data if you open the app on a different device?"

Observe:
- Does the tester understand the data went into local storage?
- Does the tester understand it will not appear on a different device without manual transfer?
- Does any part of the import flow imply sync?

### Import larger library

**Goal:** Observe import behavior and storage quota warnings for larger datasets.

Steps:
1. Ask the tester to import a larger library (50+ cards, or a library close to any
   quota threshold).
2. Observe whether a storage quota or large import warning appears.
3. Observe whether the import completes correctly.
4. After import, ask: "Did anything feel uncertain or risky during that import?"

Observe:
- Does a storage quota warning appear at the correct threshold?
- Does the warning feel informative and actionable?
- Does the tester feel confident after the import completes?
- Is there any confusion about whether the import succeeded?

### Study session

**Goal:** Observe normal study session behavior and scheduler trust.

Steps:
1. Ask the tester to run a study session on a library they have imported.
2. Observe the study flow without intervention.
3. After the session, ask: "Did the review feel correct? Did you trust the scheduler?"
4. Ask: "Did you understand how many cards were due and why?"

Observe:
- Does the review schedule / due cards display feel trustworthy?
- Does the tester understand what "due" means?
- Is there any confusion about the FSRS/default scheduler boundary?
- Does any copy imply that review schedules sync between devices?

### Review schedule / due cards

**Goal:** Observe trust and comprehension of the due-card count and review schedule.

Steps:
1. Ask the tester to look at the dashboard or study view showing due cards.
2. Ask: "What does this number mean to you?"
3. Ask: "Do you trust this count? Does it feel correct?"
4. Ask: "What happens to this schedule if you open the app on another device?"

Observe:
- Does the tester trust the due-card count?
- Is the review schedule / due cards display clear?
- Does the tester understand the schedule is local-only?
- Does the FSRS/default boundary cause confusion?

### Backup before risky action

**Goal:** Observe whether testers spontaneously back up before risky operations.

Steps:
1. Ask the tester to prepare to do a large import or restore operation.
2. Observe whether the tester spontaneously navigates to backup before the risky action.
3. If not, prompt: "Is there anything you want to do before you proceed?"
4. After the operation (backup or no backup), observe the tester's confidence level.

Observe:
- Does the tester spontaneously back up before risky actions?
- Is the backup flow discoverable?
- Does the tester understand the backup is not sync?
- Does the tester understand backup as a restore point?

### Restore from backup

**Goal:** Observe restore flow comprehension and warning effectiveness.

Steps:
1. Ensure the tester has made a backup first.
2. Ask the tester to restore from the backup.
3. Observe whether the tester reads and understands the restore warning.
4. After restore, ask: "What did you understand about what just happened?"
5. Ask: "Were you comfortable with the restore warning?"

Observe:
- Does the restore warning ("restore may overwrite current data") land clearly?
- Does the tester understand the restore is replacing local state?
- Does the tester feel safe about the restore flow?
- Is there any confusion between restore and sync?

### Manual export/import transfer

**Goal:** Observe cross-device transfer flow comprehension.

Steps:
1. Ask the tester to export their library from one device (or one browser profile).
2. Ask the tester to transfer the file manually (USB, email, download, etc.).
3. Ask the tester to import the file on a second device (or a second browser profile).
4. After the transfer, ask: "What do you understand about how this transfer works?"
5. Ask: "What happens if you now edit data on both devices?"

Observe:
- Does the tester understand manual transfer is not sync?
- Does the tester understand the two devices now have separate, diverging copies?
- Does the tester understand they are the conflict resolver in this model?
- Does any part of the flow imply automatic sync?

### FSRS experimental/off/default boundary

**Goal:** Observe FSRS and scheduler boundary comprehension.

Steps:
1. Ask the tester to navigate to FSRS or scheduler settings (if visible to this tester).
2. Observe whether the tester understands FSRS is experimental.
3. Ask: "What does 'experimental' mean to you in this context?"
4. Ask: "Do you think FSRS review data syncs between your devices?"

Observe:
- Does the tester understand FSRS is experimental and not public opt-in?
- Does the FSRS/default scheduler boundary feel clear?
- Does any copy imply FSRS data syncs?
- Is there any confusion between the FSRS experimental toggle and a sync toggle?

### EduGen draft review/import boundary

**Goal:** Observe EduGen draft review and import boundary comprehension.

Steps:
1. Ask the tester to use the EduGen draft review/import flow.
2. Observe whether the tester understands the draft/review/import sequence.
3. Ask: "Do you feel comfortable importing this generated content?"
4. Ask: "What happens if you import content you have not reviewed?"

Observe:
- Does the EduGen draft review/import boundary feel clear?
- Does the tester understand generated content requires review before import?
- Is there any confusion about whether EduGen content is automatically added to the library?
- Does any part of the EduGen flow imply cloud content or sync?

### Mobile/PWA basic usage

**Goal:** Observe app stability and flow clarity on mobile or PWA.

Steps:
1. Ask the tester to open the app on a mobile device or install it as a PWA.
2. Ask the tester to complete a basic study session and a backup operation on mobile.
3. Observe any mobile-specific friction or confusion.
4. Ask: "Did the mobile experience feel stable and safe?"

Observe:
- Does the app behave correctly for basic study and backup on mobile?
- Is there any mobile-specific friction in the import/export flows?
- Does the mobile/PWA experience imply cloud sync or account?
- Is the Vietnamese trust copy readable and clear on mobile?

### Storage quota or large import warning

**Goal:** Observe storage quota warning behavior and comprehension.

Steps:
1. Ask the tester to import a dataset that approaches or exceeds quota thresholds.
2. Observe whether a storage quota or large import warning appears.
3. If a warning appears, ask: "What does this warning mean to you?"
4. Ask: "What would you do in response to this warning?"

Observe:
- Does the storage quota warning appear at the correct threshold?
- Does the warning feel informative and actionable?
- Does the tester understand the risk of storage quota being exceeded?
- Is the warning copy clear in both Vietnamese and English?

### Vietnamese trust copy comprehension

**Goal:** Observe whether Vietnamese-first trust copy lands correctly.

Steps:
1. Ask a Vietnamese-speaking tester to read the Vietnamese trust statement
   (`docs/trust/no-cloud-default-off.vi.md` as reference for testing the in-app copy).
2. Ask: "What does this statement tell you about where your data is stored?"
3. Ask: "Is anything unclear or ambiguous?"
4. Ask: "Does this text feel trustworthy and honest?"

Observe:
- Does the Vietnamese trust copy land clearly for Vietnamese speakers?
- Is there any term or phrase that is ambiguous or mistranslatable?
- Does the Vietnamese copy correctly communicate no-cloud/default-off?
- Is the language natural for a Vietnamese user?

### User confusion around sync/cloud/account claims

**Goal:** Identify any copy, UI element, or flow that implies sync, cloud, or account.

Steps:
1. Ask the tester to use the app freely, paying attention to any text or element that
   suggests sync, cloud backup, or account features.
2. After the session, ask: "Did you see any text or feature that suggested your data
   might be backed up automatically or synced to the cloud?"
3. Ask: "Was there any moment where you thought you needed an account?"
4. Ask: "Did anything suggest multi-device sync was available?"

Observe:
- Does any element imply sync exists?
- Does any element imply cloud backup exists?
- Does any element imply an account is required or available?
- Does any copy cross the forbidden-claim boundaries from Phase 19D?

---

## Backup and restore observation

During all backup and restore scenarios, observe and record:

- Whether the tester reads the backup/restore warning without prompting.
- Whether the tester understands that backup is not sync.
- Whether the tester understands that restore may overwrite current data.
- Whether the tester makes a backup before restore without being prompted.
- Whether the restore operation completes successfully.
- Whether the restored data matches the backup snapshot.
- Whether the tester expresses confidence or concern after the restore.

---

## Manual transfer observation

During all manual transfer scenarios, observe and record:

- Whether the tester understands the export step produces a local file.
- Whether the tester understands the import step on a second device reads a local file.
- Whether the tester understands this is not automatic sync.
- Whether the tester understands the two devices will diverge if edited separately.
- Whether the transfer completes successfully end-to-end.
- Whether the tester expresses confidence or concern about the transfer.

---

## FSRS and scheduler observation

During FSRS and scheduler scenarios, observe and record:

- Whether the tester understands FSRS is experimental and not public opt-in.
- Whether the tester understands review schedules are local-only and do not sync.
- Whether any FSRS copy implies sync.
- Whether the FSRS/default scheduler boundary causes confusion.
- Whether the tester trusts the due-card count and review schedule display.
- Whether the tester asks about syncing review progress between devices.

---

## Import and large data observation

During import and large-data scenarios, observe and record:

- Whether the storage quota warning appears at the correct threshold.
- Whether the warning is readable and actionable.
- Whether the import completes correctly for small, medium, and large libraries.
- Whether the tester understands where imported data goes (local storage).
- Whether the tester feels confident after the import completes.
- Whether any import operation causes unexpected behavior or data loss.

---

## Mobile/PWA observation

During mobile and PWA scenarios, observe and record:

- Whether basic study and backup operations work correctly on mobile.
- Whether the mobile UI is legible and usable.
- Whether the trust copy is readable on a small screen.
- Whether any PWA-specific behavior implies cloud sync or automatic backup.
- Whether the Vietnamese trust copy is readable and clear on mobile.

---

## Vietnamese-first trust copy observation

During Vietnamese-language testing, observe and record:

- Whether the Vietnamese trust copy communicates no-cloud/default-off clearly.
- Whether any term or phrase is ambiguous or misleading in Vietnamese.
- Whether the Vietnamese copy matches the English companion in meaning.
- Whether any Vietnamese-speaking tester is confused about data storage.
- Whether Vietnamese-first copy in the app (if shown) aligns with the trust documents.

---

## Questions to ask testers

After each session, ask these questions and record the responses:

### Data safety and storage

1. Did the tester understand data is local? In your own words, where do you think your
   Shime data is stored?
2. Did the tester understand there is no cloud sync today? Did you expect your data to
   be automatically backed up anywhere?
3. Did the tester understand backup is not sync? What is the difference between a
   backup and sync, in your understanding?
4. Did the tester understand restore may overwrite current data? Were you comfortable
   with the restore operation? Did anything surprise you?

### Safety signals

5. Did the tester feel safe before import/restore? Before you imported or restored, did
   you feel you understood what was going to happen?
6. Did the tester know what to do before risky actions? Did you make a backup before
   importing or restoring? If yes, was that spontaneous or prompted?
7. Did any action feel like it could lose data? Was there any moment in the session
   where you felt your data might be at risk?

### Trust copy and clarity

8. Did manual transfer feel understandable? Did the export/import transfer flow feel
   clear and understandable? Did you understand it was manual and not automatic?
9. Did any copy imply account/cloud/sync? Did you see any text or feature that suggested
   sync, cloud, or account features exist?
10. Did review schedules or FSRS copy feel confusing? Did the review schedule or due-card
    display feel trustworthy? Did anything suggest sync?
11. Did Vietnamese-first trust copy feel clear? (Vietnamese-speaking testers only) Was
    the Vietnamese text clear and trustworthy?

---

## What to record

For each testing session, record:

- Date, session number, tester identifier (internal label only, not stored in app code).
- Which scenarios were tested.
- Verbatim or paraphrased responses to each feedback question.
- Any unexpected behaviors observed during the session.
- Any confusion around backup/sync/cloud/account.
- Any data safety events (unexpected data loss, quota hit, restore failure).
- Overall confidence level of the tester (1–5 scale, qualitative notes).
- Recommendation: proceed to Phase 20D, surface in Phase 20C, or hold for investigation.

---

## What not to record

Do not record:

- Tester names, emails, or any personal identifying information in app code or repository.
- Study card content from testers (unless tester explicitly consents and the content is
  synthetic/non-sensitive).
- Review schedule data or FSRS metadata from testers.
- Backup file contents from testers (unless voluntarily shared for debugging).
- localStorage contents from testers (unless voluntarily shared for debugging).
- Account credentials, cloud credentials, or any authentication data.

---

## Stop conditions during testing

Stop the current scenario and record the event if:

- A tester loses real study data during a testing operation.
- A tester experiences a restore that overwrites data they did not intend to overwrite.
- A tester cannot recover data after a restore or import operation.
- An import operation causes the app to become non-functional.
- A storage quota limit is hit unexpectedly during normal operation.
- A tester believes Shime is cloud-backed and cannot be corrected.
- A tester believes sync exists and cannot be corrected.
- A tester's backup cannot be restored.
- The tester expresses serious distress about data safety.

Stop all testing and escalate to Phase 20D hold if:

- More than one tester confuses backup with sync.
- More than one tester believes data is automatically backed up to the cloud.
- Any tester loses data without a recoverable path.
- Vietnamese trust copy is misunderstood by multiple Vietnamese-speaking testers.
- FSRS copy implies sync to multiple testers.

---

## Post-test review

After each testing session:

1. Review recorded responses against the feedback questions.
2. Identify any patterns across multiple testers (e.g., repeated confusion about backup
   vs sync, repeated confusion about data locality).
3. Classify each feedback item as:
   - No action needed: tester understood correctly.
   - Phase 20C input: performance, quota, or stress scenario needed.
   - Phase 20D hold signal: trust, safety, or data integrity concern.
4. Aggregate findings for the Phase 20D evidence handoff.

---

## Phase 20D evidence handoff

At the conclusion of Phase 20B testing, prepare a Phase 20D evidence summary:

- Total number of testing sessions conducted.
- List of scenarios tested.
- Summary of feedback question responses (aggregated, no personal data).
- List of identified confusion patterns (backup vs sync, data locality, FSRS copy, etc.).
- List of any stop conditions triggered and their resolutions.
- List of any data safety events and their resolutions.
- Recommendation: beta-ready, hold for specific issues, or conditional beta with known
  limitations documented.

This evidence handoff document is an external artifact (not app code, not committed to
the repository). It is provided to the Phase 20D decision gate as human-readable notes.

Phase 20D consumes Phase 20A–20C evidence and decides beta-ready or hold. Phase 20D is
the final gate before any broader beta announcement.
