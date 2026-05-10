# Phase 12D — Dashboard Today Card UX Plan

## 1. Purpose

Phase 12D documents the future Dashboard Today Card UX plan for Shime Quiz. The plan prepares a later runtime phase around a simpler first dashboard question: "What should I study today?"

Phase 12D is docs/static-validator/CI-only. Phase 12D does not implement Dashboard runtime changes. Dashboard Today Card runtime is not implemented by Phase 12D. Phase 12D prepares a future Phase 12E runtime implementation.

## 2. Baseline

The project is completed/merged through Phase 12C. The Phase 12A roadmap/scope lock exists. The Phase 12B storage capacity / IndexedDB migration planning document exists. The Phase 12C storage quota warning runtime exists where supported by browser storage estimate APIs.

The current app remains local-first and browser-local. Current portability remains manual backup/export/import. There is no backend/cloud/account sync.

## 3. Problem statement

The Dashboard can become data-heavy as study history, mastery/progress summaries, recommendation panels, and operational warnings accumulate. Metrics and analytics are useful, but they can also increase first-screen decision cost for learners who mainly need a simple next action.

The planning assumption for a future Dashboard runtime phase is that the first screen should answer: "What should I study today?" This is a UX risk framing, not a claim that formal user research has been completed. The plan should simplify first-screen decision-making without deleting existing analytics or hiding important safety information.

## 4. Today Card concept

The future Today Card should act as a hero/primary Dashboard surface. Planned elements include:

- today's study summary;
- due review count if available from existing data;
- possible new-question suggestion if available from existing data;
- one primary CTA such as "Bắt đầu học" or "Học hôm nay";
- short learner-friendly copy;
- optional secondary detail link for users who want more context.

Exact data availability must be confirmed in Phase 12E before implementation. Phase 12D does not add data sources and does not change existing Dashboard runtime behavior.

## 5. Primary CTA plan

The future CTA should continue using existing routes/navigation where possible. It should not change Study Room learning logic, Study Room answer correctness behavior, scoring/SRT/mastery algorithms, or recommendation algorithms. It should not create new data model requirements unless a later phase explicitly plans and validates them.

The CTA should gracefully handle empty library, no due items, and first-run states. In these states, it should guide the user toward existing safe actions such as importing quiz data, using available sample/onboarding guidance if present, or reviewing available content without requiring an account or cloud service.

## 6. Progressive disclosure plan

Future runtime should keep analytics available without overwhelming the first screen:

- primary Today Card first;
- secondary metrics below the primary section or collapsible if appropriate;
- existing analytics should not be deleted without a separate decision;
- advanced metrics should remain accessible;
- mobile layout should prioritize the Today Card and CTA before dense metrics.

This is a planning requirement only. Progressive disclosure is not implemented by Phase 12D.

## 7. Empty states

Future Phase 12E runtime should plan explicit empty states:

| Empty state | User-friendly message direction | Safe action | Boundary |
| --- | --- | --- | --- |
| No quiz data yet | Explain that the learner needs quiz content before a daily plan can be shown. | Point to existing import/sample guidance where available. | No account or cloud requirement. |
| Imported quiz data but no due reviews | Explain that there may be no scheduled reviews waiting right now. | Offer a safe path to study available questions or review the library if existing routes support it. | No scoring or SRT change. |
| Study history unavailable | Explain that the dashboard has limited progress context. | Offer a general study entry point if existing data supports it. | No invented history. |
| Storage warning visible from Phase 12C | Keep backup guidance visible without competing with the study CTA. | Encourage manual backup through existing backup/export flow. | No automatic backup or upload. |
| First-run user who needs sample/import guidance | Use simple copy that explains the first useful action. | Direct to existing onboarding/import paths where available. | No cloud/account dependency. |

## 8. Accessibility and mobile-first requirements

Future runtime should meet these requirements:

- clear heading hierarchy;
- readable copy with low cognitive load;
- keyboard reachable CTA;
- visible focus states;
- sufficient tap target size;
- status indicators that do not rely only on color;
- responsive/mobile-first layout;
- no required hover interaction;
- compatibility with existing E2E-visible text where applicable.

## 9. Data/source requirements for future Phase 12E

Phase 12E must inspect existing implementation details before runtime work:

- existing Dashboard data sources;
- due/review counts;
- recommendation data;
- study history availability;
- mastery/progress summaries;
- empty library state;
- route/navigation entry points;
- existing tests and selectors;
- storage quota warning interaction if visible on the same page or shared layout.

Phase 12D does not add or change data sources.

## 10. Testing/evidence requirements for future runtime

Future Phase 12E runtime work should collect evidence for:

- build pass;
- target validator pass;
- existing dashboard smoke/regression validator pass;
- E2E smoke/onboarding pass or environment-blocked classification;
- manual dashboard render check;
- mobile viewport check if available;
- keyboard focus check if available;
- no Study Room/scoring regression;
- no backup/storage regression.

## 11. Non-goals for Phase 12D

Phase 12D does not:

- implement Dashboard Today Card runtime;
- change Dashboard layout;
- change Study Room behavior;
- change routes/navigation;
- change scoring/SRT/mastery/recommendation algorithms;
- change storage schema;
- change backup format;
- add unit tests;
- add dependencies;
- change package version;
- implement IndexedDB;
- implement FSRS;
- implement cloud/account sync;
- implement automatic sync;
- implement encryption;
- create release package;
- create release tag;
- publish GitHub Release.

## 12. Allowed claims after Phase 12D

Allowed claims:

- Dashboard Today Card UX plan exists.
- Phase 12D documents a future Dashboard simplification strategy.
- Phase 12D documents primary CTA, progressive disclosure, empty states, accessibility, mobile-first, and testing requirements.
- Phase 12D prepares Phase 12E runtime work.
- No Dashboard runtime behavior was changed by Phase 12D.

## 13. Forbidden claims after Phase 12D

Forbidden claims:

- Dashboard Today Card implemented.
- Dashboard runtime changed.
- Study CTA implemented.
- Analytics progressive disclosure implemented.
- Mobile dashboard redesign implemented.
- Mastery heatmap implemented.
- Recommendation algorithm changed.
- Study Room behavior changed.
- Scoring/SRT/mastery changed.
- Package version changed.
- Dependencies changed.
- Release package created.
- Release tag created.
- GitHub Release published.
- Production/security/accessibility/performance certification.

## 14. Recommended next phase

Recommended next phase: Phase 12E — Dashboard Today Card Runtime.

Phase 12E should be a narrow runtime UX phase that implements the planned Today Card without changing Study Room logic, scoring/SRT/mastery algorithms, storage schema, backup format, or package dependencies.


## Phase 12E follow-up

Phase 12E implements the planned Dashboard Today Card runtime as a narrow Dashboard UX improvement. It does not change Study Room behavior, scoring/SRT/mastery/recommendation algorithms, storage schema, or backup format.
