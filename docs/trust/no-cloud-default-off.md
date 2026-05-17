# No Cloud by Default / Sync Always Default-Off

This is the official Shime trust copy for user data.
The Vietnamese version (`no-cloud-default-off.vi.md`) is the primary source of truth.
This English document is the companion translation.

---

## Purpose

This document states clearly what Shime does with your data — and more importantly,
what Shime does **not** do.

Shime is committed to not overclaiming. If a feature does not exist, Shime will
say so plainly, rather than using vague language or making ungrounded future promises.

---

## What Shime is today

Shime is a vocabulary learning app that runs **locally on your device**:

- no account required.
- no login.
- no Shime server.
- no cloud by default.
- sync is always default-off — because there is no sync today.
- data lives on this device and goes nowhere, unless you export it yourself.

---

## What Shime does not do today

Shime does **not** do any of the following today:

- Does not store your data in the cloud.
- Does not send data to a Shime server (no server exists).
- Does not create or require a user account.
- Does not authenticate your identity.
- Does not sync data between devices.
- Does not sync review schedules.
- Does not sync FSRS data.
- Does not automatically transfer data to another device.
- Does not delete localStorage.
- Does not switch storage backends in production.

---

## Where your data lives

All Shime data lives in **localStorage** in the browser on this device.
localStorage remains the canonical production source of truth.

This means:

- If you clear browser data, your Shime data is also cleared.
- If you switch to a different device, your data **does not follow automatically**.
- If you use private/incognito mode, your data will be lost when you close the tab.

Shime cannot recover data lost due to user deletion or browser-side clearing.

---

## Backup, export, import, and restore

Core principle: backup is not sync. These are two distinct concepts and Shime must never conflate them.

**Backup:**

- You explicitly press "Back up" and download a backup file.
- That file lives on the device you downloaded it to.
- Shime does not back up automatically.

**Export:**

- You download a file containing your data (vocabulary, study history, settings, etc.).
- That file is yours, stored on the device you choose.

**Import:**

- You actively select a file and load it into Shime.
- Data from the file is written into localStorage on the current device.

**Restore:**

- restore may overwrite current data. This action cannot be undone if you have no
  prior backup.
- Shime will warn you before restoring.

---

## Manual transfer first, sync later only if safe

If you need to use Shime on multiple devices, the only current path is **manual transfer**:

1. Export your data on the old device.
2. Move the file to the new device (USB, email, etc.).
3. Import your data on the new device.

This is not sync. This is manual transfer. If you edit data on both devices after
the transfer, the two data sets will **diverge**, and Shime cannot automatically
merge them.

Shime is designing a better manual transfer experience (Phase 20A–20D).
This feature is not yet shipped and has no confirmed timeline.

---

## If sync exists later, it must be optional

Shime does not have sync today. If sync is ever considered in the future, the
following rules **must** all be met before implementation:

- Sync must be optional, never on by default.
- The user must explicitly enable sync.
- Before sync merges any data, Shime must capture a restorable backup.
- Users must be clearly warned if there are conflicts.
- Backup and restore must continue to work independently, unaffected by sync.

None of the above applies today because sync does not exist.

---

## Data conflicts and why Shime must not promise "no conflicts"

If you use Shime on multiple devices and edit data on both, conflicts will occur.
This is a technical reality, not a design flaw.

Shime must not promise no conflicts because:

- Any sync system can produce conflicts.
- Promising "no conflicts" is either a lie or a cover-up.
- Silent conflicts (not surfaced to the user) can cause silent data loss.

Shime must not promise absolute data-loss prevention. Data loss can occur if:

- You manually clear localStorage.
- The browser clears site data.
- You restore without a prior backup.
- You edit on two devices and merge incorrectly.

The best current protection is **regular backups**.

Shime must not claim end-to-end encryption. Shime must not claim zero-knowledge.
These features have not been built, and Shime will not use that language until
they genuinely exist.

---

## FSRS, review schedules, and memory data

FSRS (Free Spaced Repetition Scheduler) is a review scheduling algorithm based on
memory theory. Shime is developing FSRS support, but this feature is not yet
publicly available.

Mandatory rules for FSRS and review schedule data:

- FSRS must not silently sync. Silent sync can corrupt your review schedule
  without your knowledge, damaging your memory formation.
- review schedules must not silently merge across devices.
- before merging data, Shime must capture a restorable backup — this applies to
  all data families, including FSRS.
- If there are scheduling conflicts, the user must be notified and must choose.
- FSRS sync may only be considered after FSRS has been publicly released and is
  stable in production.

---

## Claims Shime may make

These are honest and defensible statements:

- "Local-first by default"
- "No account required"
- "No login required"
- "No cloud sync today"
- "No Shime server today"
- "Data stays on this device unless you export it yourself"
- "Backup and restore are manual user-controlled actions"
- "Manual transfer comes before sync"
- "Optional sync remains unshipped"
- "Conflict model is a design decision only (not yet implemented)"
- "Backup-before-merge is a future invariant"

---

## Claims Shime must not make

These are **forbidden** claims because they describe features that do not exist or
promise things Shime cannot deliver:

- "Sync exists" (sync does not exist)
- "Cloud sync exists" (cloud sync does not exist)
- "Account / auth / backend exists" (none exist)
- "Shime stores your data in the cloud" (Shime does not)
- "Encrypted end-to-end" (not implemented)
- "Zero-knowledge" (not implemented)
- "Sync just works" (sync does not exist)
- "No conflicts" (conflicts are real in any sync system)
- "Data-loss prevention is guaranteed" (it is not)
- "FSRS sync is available" (it is not)
- "Review schedules sync automatically" (they do not)
- "Production sync is ready" (it is not)
- "Production IndexedDB storage exists" (test-only only)
- "Backup/export is adapter-aware" (it is not)
- "Restore is adapter-aware" (it is not)

These claims may appear only in this "Claims Shime must not make" section —
they must not appear elsewhere in user-facing documents or UI.

---

## Criteria before any sync implementation

Shime may only consider implementing sync when **all** of the following conditions
are met. Any single condition missing is a no-go:

1. Manual transfer (Phase 20A–20D) has shipped and survived at least one real beta
   cycle with no silent data loss, no surprise overwrites, and no large support backlog.
2. The Phase 19C conflict model ADR is merged and its static-validator rules are live.
3. This Phase 19D trust copy is merged in Vietnamese and English.
4. Backup-before-merge is a static-validator invariant, not a code convention.
5. The StorageAdapter has a real (not test-only) adapter for the chosen sync target,
   with the no-op driver still available as a rollback path.
6. The Phase 17D/17E/17F event-log / manifest / journal designs are promoted from
   test-only prototypes to runtime contracts.
7. FSRS public opt-in has shipped per the Phase 19A sequencing gate.
   FSRS sync follows; it never precedes.
8. A documented and rehearsed rollback story exists: disable sync, restore from
   last-good local backup, reconcile the sync target.
9. The "claims we will and will not make" appendix has been honored across README,
   landing, marketing, and in-product copy in both Vietnamese and English.
10. Solo/small-team support capacity is confirmed sufficient to handle "my sync
    didn't work" tickets without degrading the study experience for non-syncing users.

For cloud/account sync (Option D) specifically, additional criteria apply
(none currently close to being met):

11. Multi-quarter funded capacity to operate a backend.
12. Legal/privacy posture documented and reviewed.
13. A demonstrated track record of Option B and/or Option C in production for at
    least one full beta cycle.

---

## User note

Shime believes in honesty over features. If a feature does not exist, Shime will
say so plainly. If a promise cannot be kept, Shime will not make it.

Today: your data is on this device. Back up regularly.
If you need to transfer data to another device, manual export and import is the
only current path.

Shime will announce when a better transfer experience is available.
