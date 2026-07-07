# Cognitive Companion Integration Readiness Gate

| Gate | Requirement | Evidence | Test Coverage | Stop Condition | Owner | Next Phase |
| --- | --- | --- | --- | --- | --- | --- |
| Privacy | Only redacted/coarse context enters kernel | Forbidden-key recursion and valid scenario scan | `companionPrivacySafety`, `companionIntegrationReadiness` | Any raw quiz field in valid context | App/Kernal | Phase 22 simulation |
| Determinism | Same input produces same output | Simulator transcript equality | `companionScenarioSimulator`, `companionRegressionMatrix` | Time/random/storage dependency | Kernel | Phase 22 simulation |
| Safety governor | Motion disabled and unsafe transport neutralized | Governor blocks disconnected/error/disabled transport | `safetyGovernor`, `companionRegressionMatrix` | Robot command on unsafe transport | Kernel/Robot | Phase 22 simulation |
| Robot action | Planner emits allowed commands only | Safe command allowlist | `robotIntentPlanner` | Unknown command emitted | Robot | Phase 22 simulation |
| UI clarity | No UI claims of real AI/robot readiness yet | No UI wiring | Isolation tests | UI imports companion prematurely | UI | Later UI phase |
| Device Bridge compatibility | Existing coarse event types reduce safely | Event type parity test | `companionIntegrationReadiness` | Device event cannot reduce safely | Bridge | Phase 22 simulation |
| ESP32 adapter | Adapter remains future-only | Docs only | Review docs | Firmware changed prematurely | Firmware | Later hardware adapter |
| Manual QA | Simulator reviewed before live wiring | Scenario playbook | Manual checklist pending | Unreviewed scenario behavior | QA | Phase 22 simulation |
| Rollback | Companion can be removed without app behavior change | No runtime imports | Isolation tests | App runtime dependency appears | App | Phase 22 simulation |

Overall gate status: PASS for simulation, not yet live app integration.
