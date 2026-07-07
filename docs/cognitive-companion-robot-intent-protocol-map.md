# Cognitive Companion Robot Intent Protocol Map

Motion status: disabled by default.

| Companion intent | Safety decision | Robot command | Protocol payload | Allowed fields | Forbidden fields | Future ESP32 action |
| --- | --- | --- | --- | --- | --- | --- |
| `focus_gently` | allowed expression-only | `focus` | command + reason | command, reasonCode, intensityBucket, safetyMode, transportStatus | prompt/answer/history/settings/raw payload | eyes attentive |
| `encourage` | allowed expression-only | `encourage` | command + reason | same | same | gentle expression |
| `celebrate_small` | rate-limited | `celebrate` or `focus` | command + reason | same | same | expression only |
| `review_reminder` | allowed expression-only | `due_review` | command + reason | same | same | review expression |
| `session_complete` | allowed expression-only | `session_complete` | command + reason | same | same | completion expression |
| `reconnect_hint` | blocked if transport unsafe | `neutral` | command + reason | same | same | neutral |
| `calm_error` | blocked/downgraded | `neutral` or `error_signal` | command + reason | same | same | neutral/error eyes |
