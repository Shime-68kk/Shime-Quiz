# Cognitive Companion Test Matrix

| Area | Test File | Coverage |
| --- | --- | --- |
| Context schema | `companionContextSchema.test.js` | normalization and recursive forbidden keys |
| Learning reducer | `learningSignalReducer.test.js` | safe events, sensitive payload rejection, momentum/frustration |
| Robot presence | `robotPresenceSignalReducer.test.js` | coarse non-camera presence and degraded sensor |
| Policy engine | `companionPolicyEngine.test.js` | explainable decisions and privacy failure |
| Safety governor | `safetyGovernor.test.js` | motion downgrade, privacy lock, celebration rate limit |
| Robot planner | `robotIntentPlanner.test.js` | safe command allowlist and no raw fields |
| Simulator | `companionScenarioSimulator.test.js` | deterministic transcript and blocked attack scenario |
| Privacy/isolation | `companionPrivacySafety.test.js` | no storage/network/AI imports and no runtime wiring |
| Integration readiness | `companionIntegrationReadiness.test.js` | Device Bridge event compatibility and isolation |
| Regression matrix | `companionRegressionMatrix.test.js` | scenario coverage, explicit safety results, blocked unsafe inputs |
