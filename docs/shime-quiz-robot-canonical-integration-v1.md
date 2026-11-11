# Canonical Quiz-Robot Integration Decision V1

## Decision

The first canonical cross-repository contract is the existing expression preview
protocol:

- protocol: `shime_robot_expression`
- protocol version: `1.0.0`
- message type: `expression_preview`
- source: `shime_quiz`
- target: `shime_robot`

It is a compatibility and parser QA contract only. It cannot be reinterpreted as a
live command because it requires:

- `motionPolicy: locked`
- `dryRunOnly: true`
- `sendStatus: not_sent`
- `safetyStatus: allowed_dry_run`
- `privacyStatus: redacted_coarse_only`

An accepted preview produces a bounded machine-readable acknowledgement and no OLED,
LED, sound, motor, network, or storage action.

## Why expression first

Expression is the smallest useful shared language between the projects. It avoids
coupling robot runtime to quiz storage, FSRS internals, raw study events, or capsule
persistence. Learning state remains inside Quiz and is reduced to one safe expression
family before crossing the boundary.

## Existing contract conflicts

| Area | Quiz | Main robot firmware | Decision |
| --- | --- | --- | --- |
| Expression preview | `shime_robot_expression/1.0.0` | Not previously parsed | Adopt Quiz protocol for Phase 1 |
| Safe capsule version | `shime-safe-learning-capsule-v1` | `shime-safe-capsule-v1` | Do not merge in expression phases |
| Privacy class | `redacted_coarse_only` | `safe_derived_only` | Resolve in Phase 5 migration |
| Checksum | 8-character lowercase FNV hex | decimal FNV integer | Resolve in Phase 5 migration |
| Live bridge | explicit WebSocket LAN client gate | Wi-Fi context observer, no app server | Add only in Phase 3 |
| Runtime behavior | preview/dry-run | local OLED expressions | Use a new runtime contract in Phase 2 |

## Runtime contract requirements for Phase 2

The future runtime message must be distinct from `expression_preview` and include:

- unique message and request IDs;
- monotonic sequence within a negotiated session;
- creation time bucket and short TTL;
- expression family and bounded intensity only;
- capability version and safety policy version;
- no arbitrary display text;
- no raw reason text, only allowlisted reason codes;
- ACK/NACK with applied, suppressed, expired, duplicate, or rejected status;
- current coarse expression and sensor-health buckets in ACK only;
- replay, rate-limit, and queue bounds.

## Expression family mapping target

| Quiz family | Robot intent | Default behavior |
| --- | --- | --- |
| `neutral_presence` | neutral | calm idle face |
| `focus_ritual` | attention | focused eyes |
| `review_due_nudge` | attention | gentle review cue |
| `memory_risk_nudge` | curious | quiet attention cue |
| `gentle_encourage` | happy | supportive smile |
| `recovery_praise` | happy | short positive expression |
| `celebrate_stability_gain` | happy | rate-limited celebration |
| `celebrate_session_complete` | happy | session-complete celebration |
| `suggest_break_soft` | tired/calm | calm rest cue |
| `reconnect_hint` | neutral | connection-safe neutral cue |
| `calm_error` | neutral/uncertain | non-alarming fallback |
| `do_nothing` | none | preserve safe local state |

This mapping is advisory until the Phase 2 arbitration and dwell rules are implemented.

## Authority order

1. Privacy guard and invalid policy.
2. Sensor unavailable or unhealthy.
3. Immediate ToF proximity safety.
4. Memory/storage repair state.
5. Active QA override.
6. Valid, fresh Quiz expression intent.
7. Local presence expression.
8. Calm idle fallback.

App intent never unlocks motion and never overrides immediate local safety.
