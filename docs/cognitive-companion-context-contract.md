# Cognitive Companion Context Contract

Schema version: `shime-companion-context-v0`

## Envelope

- `protocolVersion`
- `contextId`
- `timestamp`
- `learningState`
- `sessionState`
- `performanceState`
- `robotPresenceState`
- `safetyState`
- `userExperienceMode`

## Allowed Coarse Fields

- `sessionPhase`
- `itemType`
- `progressBucket`
- `accuracyBucket`
- `momentumBucket`
- `frustrationRiskBucket`
- `focusRiskBucket`
- `reviewUrgencyBucket`
- `presenceBucket`
- `approachVelocityBucket`
- `interactionConfidenceBucket`
- `robotAvailability`
- `transportStatus`
- `safetyMode`

## Forbidden Data

- prompt/question/answer text
- `correctAnswer`, explanations, or typed user answers
- source metadata
- imported document text
- raw study history
- exact private settings
- backup payloads
- Wi-Fi credentials
- camera frames
- audio recordings
- biometric identity

Unknown bucket values must normalize to safe fallbacks rather than expanding the privacy surface.
