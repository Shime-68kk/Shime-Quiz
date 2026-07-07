# Cognitive Companion Scenario Playbook

Each scenario runs through learning reducer, presence reducer, policy engine, safety governor, and robot intent planner.

| Scenario | Expected Decision | Safety Action | Robot Intent | Premium UX | Privacy Basis |
| --- | --- | --- | --- | --- | --- |
| first question | `focus_gently` | allow expression-only | `focus` | attentive eyes | item type/progress only |
| correct streak | `celebrate_small` | rate-limit if repeated | `celebrate` or `focus` | small celebration | correctness bucket only |
| repeated wrong | `suggest_break` | allow calm encouragement | `encourage` | gentle support | no answer text |
| user near | `idle_presence` | neutral | `neutral` | notices approach | coarse presence only |
| review due | `review_reminder` | allow expression-only | `due_review` | review cue | due bucket only |
| low accuracy complete | `celebrate_small` | expression-only | `session_complete` | calm completion | accuracy bucket only |
| high accuracy complete | `celebrate_big` | expression-only | `session_complete` | premium finish | accuracy bucket only |
| disconnected transport | `reconnect_hint` | blocked to neutral | `neutral` | calm disconnected | transport bucket only |
| sensor unhealthy | `calm_error` | safe error family | `error_signal` | neutral caution | sensor health bucket |
| sensitive attack | `calm_error` | blocked | `neutral` | no visible private response | forbidden key rejection |

No scenario requires prompt text, answer text, imported content, full history, settings, backup payloads, camera frames, audio, or identity.
