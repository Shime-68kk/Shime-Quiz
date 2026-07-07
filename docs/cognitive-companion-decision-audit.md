# Cognitive Companion Decision Audit

Date: 2026-06-27 09:35:19 +07

Run:

```bash
node tools/deviceBridge/companionDecisionAuditReport.mjs
```

Audit entries include step, input event type, accepted/rejected status, session summary buckets, policy intent, hysteresis adjustment, safety decision, final robot intent label, reason codes, privacy status, and `dryRunOnly`.

Audit entries never include raw payloads, quiz prompts, answers, source metadata, study history, settings, or backup payloads.

