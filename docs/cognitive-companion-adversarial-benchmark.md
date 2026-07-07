# Cognitive Companion V2 Adversarial Benchmark

The adversarial benchmark generates deterministic, bounded event streams to stress the Companion V2 decision engine without app runtime integration.

## Generator

`src/companion/companionAdversarialGenerator.js` uses a small seeded pseudo-random generator. It does not use crypto randomness, `Date.now`, storage, network, hardware, or AI APIs.

## Scenario Categories

- Long correct streak
- Long wrong streak
- Alternating correct/wrong
- Repeated `question_presented` spam
- Session complete without answers
- Answer before question
- Repeated session complete
- Review due storm
- Bridge error storm
- Disconnected mid-session
- Transport recovered
- Sensor unhealthy
- Robot unavailable
- Classroom safe profile
- Premium showcase profile
- Malformed event type
- Unknown item type
- Missing session id
- Sensitive key attack
- Nested sensitive key attack
- Huge but bounded sequence

## Pass Meaning

Valid scenarios must preserve privacy/safety invariants. Attack scenarios must be blocked or rejected. Stress scenarios may lower non-spam quality scores, but they must not leak sensitive data, enable motion, or create an external send path.

The default seed is `31032`; tests also use additional fixed seeds.
