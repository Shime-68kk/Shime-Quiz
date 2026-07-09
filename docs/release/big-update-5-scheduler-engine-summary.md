# BIG-UPDATE-5 Scheduler Engine Release Summary

Decision status: BIG_UPDATE_5_SCHEDULER_ENGINE_DEFINED

## Summary

BIG-UPDATE-5 adds a local-first pluggable scheduler layer, SM2 adapter, FSRS beta adapter, readiness gate, comparison lab, beta preference/rollback model, backup metadata helpers, validator, docs, and tests.

## Release Boundaries

- SM2 remains default: yes.
- FSRS remains beta opt-in: yes.
- FSRS default approval: no.
- Cloud/AI/external service/backend/network added: no.
- Raw question/answer required by scheduler: no.
- StudyRoom runtime replacement: no.
- Irreversible migration: no.

## Evidence

The comparison lab covers 12 deterministic scenarios and keeps the aggregate recommendation at `keep_sm2_default_fsrs_beta`.

## Next Safe Step

Run extended evidence collection with real local study schedule snapshots converted into safe derived inputs. Do not make FSRS default until product UX, rollback, backup, import, and StudyRoom behavior are proven under a separate approval phase.
