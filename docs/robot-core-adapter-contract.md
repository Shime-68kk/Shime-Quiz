# Robot Core Adapter Contract

The future adapter translates between Shime companion decisions and robot-body behavior.

## Inputs

- App event -> companion decision.
- Robot presence state -> companion context.
- Robot safety state -> safety governor.

## Outputs

- Companion decision -> safe robot action intent.
- Allowed commands: `neutral`, `focus`, `encourage`, `celebrate`, `due_review`, `session_complete`, `error_signal`.

## Non-Negotiable Boundaries

- Never send raw quiz content.
- Never let the robot control scoring, history, scheduling, settings, import, backup, or library state.
- Never bypass privacy lock.
- Never enable motion without a separate safety-reviewed phase.
- Never copy robot firmware credentials into the app repo.
