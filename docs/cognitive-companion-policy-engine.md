# Cognitive Companion Policy Engine

The policy engine is deterministic, local, and explainable. It accepts only a validated companion context and returns:

- `intent`
- `tone`
- `urgency`
- `reasonCodes`
- `allowedRobotActionFamily`
- `shouldSpeak`
- `shouldMove`
- `shouldNotify`

Supported intents include `focus_gently`, `encourage`, `celebrate_small`, `celebrate_big`, `neutral_wait`, `suggest_break`, `review_reminder`, `calm_error`, `reconnect_hint`, and `idle_presence`.

The policy engine must avoid overreacting. High-risk or ambiguous conditions should map to calm, neutral, or expression-only behavior until a future safety phase proves otherwise.
