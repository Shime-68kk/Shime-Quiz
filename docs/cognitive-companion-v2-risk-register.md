# Cognitive Companion V2 Risk Register

Date: 2026-06-27 09:35:19 +07

- Overreaction: mitigated with hysteresis and neutral fallback.
- Underreaction: replay benchmark flags weak helpfulness.
- False frustration detection: based only on coarse repeated-wrong buckets.
- Celebration spam: behavior memory and hysteresis rate-limit repeats.
- Break suggestion spam: delayed until repeated wrong threshold.
- Premium UX overclaim: docs state this is deterministic local logic, not AI.
- Child/classroom safety: classroom profile lowers intensity.
- Future AI boundary: no AI API in V2.
- Robot motion future risk: `shouldMove` remains false by default and output is dry-run only.

