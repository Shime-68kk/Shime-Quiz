# Cognitive Companion Behavior Memory

Date: 2026-06-27 09:35:19 +07

`companionBehaviorMemory.js` is short-lived in-memory state for the current companion session.

It exists to avoid repeated celebration spam, repeated encouragement spam, premature break suggestions, and rapid oscillation between behavior families.

It does not persist, identify users, store full history, store raw quiz content, or create long-term profiling. Reset creates an empty bounded memory.

