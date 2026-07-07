# Cognitive Companion Architecture

## Layers

1. Learning signal layer: receives Device Bridge-style redacted/coarse events.
2. Privacy reducer layer: rejects forbidden private keys recursively.
3. Companion context layer: normalizes coarse learning and robot presence state.
4. Policy engine: produces explainable companion decisions with reason codes.
5. Safety governor: enforces privacy lock, motion-disabled default, rate limits, and neutral fallback.
6. Robot intent planner: maps decisions to safe robot command families.
7. Device Bridge protocol: optional future transport boundary for redacted/coarse commands.
8. Robot body layer: local sensor/expression/actuator implementation that obeys safety.
9. Future AI provider boundary: optional research boundary, never default.

## Data Flow

```text
Study event / robot presence signal
  -> privacy reducers
  -> companion context
  -> policy engine
  -> safety governor
  -> robot intent planner
  -> Device Bridge command or simulator transcript
```

The companion kernel must not receive prompts, questions, answers, explanations, imported content, full history, backups, credentials, camera frames, audio recordings, or biometric identity.
