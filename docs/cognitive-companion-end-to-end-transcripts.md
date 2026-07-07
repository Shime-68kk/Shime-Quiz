# Cognitive Companion End-to-End Transcripts

## Normal Session

```text
[COMPANION BRIDGE] event=session_started accepted=yes command=focus privacy=redacted_coarse_only
[COMPANION BRIDGE] event=question_presented accepted=yes command=focus privacy=redacted_coarse_only
[COMPANION BRIDGE] event=answer_correct accepted=yes command=celebrate privacy=redacted_coarse_only
```

## Struggle Session

```text
[COMPANION BRIDGE] event=answer_wrong accepted=yes intent=encourage command=encourage
[COMPANION BRIDGE] event=answer_wrong accepted=yes intent=suggest_break command=encourage
```

## High Achievement

```text
[COMPANION BRIDGE] event=session_complete accepted=yes intent=celebrate_big command=session_complete
```

## Disconnected Robot

```text
[COMPANION BRIDGE] event=question_presented accepted=yes safety=blocked command=neutral
```

## Sensitive Payload Attack

```text
[COMPANION BRIDGE] event=question_presented accepted=no safety=blocked command=neutral privacy=blocked
```

Examples intentionally omit all quiz content.
