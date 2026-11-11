# BIG-UPDATE-14 StudyRoom Feedback Expressions

## Boundary

StudyRoom's existing evaluator remains authoritative. Existing `mascotReaction` derives a coarse state only after evaluation: `neutral`, `correct`, `incorrect`, `revealed`, or `completed`. `ShimeStudyCompanion` receives only that coarse reaction, a localized message, and an accessibility label.

It does not receive prompt, answer, correct answer, explanation, imported text, history, score internals, scheduler state, or raw quiz payload.

## Expressions

- Neutral: attentive hardware eyes with sparse blink and restrained float.
- Correct: theme-colored happy eye shape with one 320ms lift/nod, then a stable positive expression.
- Incorrect: theme-colored sympathetic lowered eyes with one 380ms gentle shake, then a stable sympathetic expression.
- Revealed: quieter narrowed eyes without correctness semantics.
- Complete: positive stable eyes with one restrained lift.

Vietnamese feedback is concise: “Chính xác — tiếp tục nhé.” and “Chưa đúng — xem lại đáp án rồi thử tiếp nhé.” English equivalents follow the same calm tone.

## Lifecycle

The existing Next action changes the current item and naturally returns the coarse reaction to neutral. CSS animation starts only when the feedback class enters; theme/language rerenders do not remount or delay the action. No timer, random loop, additional correctness calculation, or delayed progression was added.
