# Shime Quiz + Robot Upgrade Roadmap

## Product target

Shime Quiz is the canonical learning and scheduling brain. Shime Robot is the
local presence and expression endpoint. The first production-worthy slice is:

```text
Study event -> coarse learning state -> safety governor -> expression intent
-> local transport -> robot arbitration -> OLED -> acknowledgement
```

The robot must never receive raw questions, answers, documents, card IDs,
study history, credentials, or RF identifiers. Motion remains locked until a
separate hardware safety program is approved.

## Non-negotiable invariants

- Quiz remains authoritative for learning state and scheduling.
- ToF remains authoritative for immediate physical safety and local presence.
- RF remains aggregate context only and never proves identity or human presence.
- Safety and privacy overrides win over app and local expression intents.
- Expression messages are ephemeral; learning capsules are not the live control path.
- Every live message has an ID, bounded size, expiry, acknowledgement, and reason code.
- Unknown versions, fields, actions, or unsafe flags fail closed.
- No phase silently enables motor, camera, microphone, cloud, or persistent raw data.

## Phase 0 - Stabilize and establish one source of truth

Goal: stop protocol drift before adding runtime behavior.

Deliverables:

- This roadmap and the canonical integration decision record.
- Baseline build/test reports for both repositories.
- One compatibility matrix for expression, capsule, transport, and acknowledgement.
- Explicit separation of `preview`, `runtime expression`, and `capsule import` contracts.
- Toolchain baseline: Node 20.19+ or 22.12+, current PlatformIO environment pinned.

Exit gate:

- Both projects build from documented commands.
- The canonical expression fixtures are accepted by both parsers.
- No runtime output or transport is enabled by this phase.

## Phase 1 - Cross-repository serial preview bridge

Goal: prove that the real robot firmware can parse the exact envelope produced by Quiz.

Deliverables:

- Add the tested `shime_robot_expression/1.0.0` preview parser to the main robot firmware.
- Accept newline-delimited envelopes over USB Serial.
- Emit machine-readable accept/reject acknowledgement without echoing the payload.
- Run the same valid, invalid, oversized, sensitive-key, and motion-unlock fixtures.
- Keep OLED, LED, sound, network, storage, and motor untouched by preview messages.

Exit gate:

- 100% valid golden fixtures accepted.
- 100% unsafe fixtures rejected with stable reason codes.
- Zero raw payload echo and zero hardware output.
- Robot simulation build and host tests pass.

## Phase 2 - Expression-only OLED runtime

Goal: deliver the first user-visible end-to-end value without motion.

Deliverables:

- Define a separate runtime message type; never reinterpret `expression_preview` as live control.
- Add message ID, request ID, monotonic sequence, TTL, deduplication, and ACK/NACK.
- Map the canonical expression families to the existing OLED face intents.
- Add dwell, cooldown, rate limiting, and calm fallback.
- Add a hard arbitration order: privacy -> sensor health -> proximity safety -> app intent -> idle.
- Add a physical kill switch/config gate for all non-display outputs.

Exit gate:

- A wrong-answer scenario can produce `gentle_encourage` on real OLED and receive an ACK.
- Duplicate, expired, malformed, stale-version, and disconnected cases fail safely.
- No question or answer content appears in firmware logs.
- Twenty-four-hour OLED-only soak test has no crash or expression storm.

## Phase 3 - Local LAN transport

Goal: remove the development cable while preserving local-first behavior.

Deliverables:

- ESP32 WebSocket server compatible with the existing explicit-connect Quiz client.
- Capability handshake, protocol negotiation, heartbeat, reconnect backoff, and session reset.
- User-controlled Wi-Fi provisioning without credentials in source code.
- Local-network allowlist, bounded clients, bounded queues, and rate limits.
- Mock, Serial QA, and LAN transports share one message validator.

Exit gate:

- Manual connect, disconnect, restart, router loss, and reconnect scenarios pass.
- No auto-connect and no saved endpoint without explicit consent.
- StudyRoom remains fully usable when the robot is absent.
- LAN fuzz/privacy suite passes with no raw data leakage.

## Phase 4 - Mutual context and expression arbitration

Goal: combine learning context with the robot's local presence intelligence.

Deliverables:

- Robot sends only coarse presence, availability, sensor-health, and expression-status buckets.
- Quiz uses presence only to time or suppress an intervention, never to score learning.
- Deterministic arbitration table for Quiz intent versus ToF/local state.
- Behavior memory for cooldown and repetition control; no identity tracking.
- Explainability reason codes visible in a developer-only panel.

Exit gate:

- Golden scenarios cover absent, near, approaching, leaving, sensor missing, privacy guard,
  review due, repeated wrong answer, recovery, and session complete.
- Results are deterministic and replayable.
- RF-only input cannot claim a person is present.

## Phase 5 - Canonical safe capsule and advisory memory

Goal: unify non-live learning summaries after the expression path is stable.

Deliverables:

- Replace the two incompatible safe-capsule dialects with one versioned schema.
- Use canonical serialization and one checksum representation.
- Add explicit expiry, provenance bucket, schema migration, and replay protection.
- Keep capsule import advisory and expression-only.
- SD writes use atomic journal/manifest recovery and bounded retention.

Exit gate:

- Quiz export -> robot import -> verify -> cleanup round trip passes on real SD.
- Power-loss recovery and tamper tests pass.
- Privacy audit finds zero forbidden fields.

## Phase 6 - Performance, maintainability, and observability

Goal: make the system small enough and clear enough to evolve safely.

Deliverables:

- Split `SerialBrainQa` into command router and bounded feature modules.
- Separate production, QA, collection, and simulation firmware feature sets.
- Archive legacy R3/R5 paths that are no longer authoritative.
- Add flash/RAM budgets and fail CI when budgets regress.
- Code-split the Quiz bundle and upgrade the Node toolchain.
- Add structured health snapshots, crash counters, and privacy-safe diagnostics.

Exit gate:

- Robot production image is below the agreed flash budget with recovery headroom.
- Quiz has no unsupported Node warning and meets the agreed initial bundle budget.
- One architecture document matches the runtime implementation.

## Phase 7 - Hardware beta and product readiness

Goal: validate real use rather than simulator completeness.

Deliverables:

- A repeatable hardware BOM, wiring revision, enclosure, thermal and power checks.
- Multi-day desk trials and a small consented beta cohort.
- Provisioning, reset, update, rollback, diagnostics, and support playbook.
- Accessibility and calmness review for light, animation, sound, and interruption frequency.
- Threat model and release evidence for the exact shipping configuration.

Exit gate:

- Seven-day soak test and recovery tests pass on multiple devices.
- Beta users complete setup without developer tools.
- No P0/P1 safety, privacy, data-loss, or lockup defects remain.

## Phase 8 - Optional motion research

Motion is a separate project, not a continuation of expression delivery. It requires
independent hardware interlocks, collision testing, power analysis, watchdog behavior,
manual emergency stop, constrained operating area, and explicit approval. It must not
be enabled by a protocol or build flag intended for OLED expression.

## Recommended order

Complete Phases 0-2 before adding more intelligence. Complete Phase 3 before any broad
demo. Complete Phases 4-6 before a hardware beta. Keep Phase 8 out of the main product
roadmap until the expression-only product has demonstrated value and reliability.
