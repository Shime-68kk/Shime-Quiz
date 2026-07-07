# Cognitive Companion Safety Governor

The safety governor is the final local rule gate before any robot intent can leave the companion kernel.

## Enforced Rules

- No motion by default.
- Downgrade requested movement to expression-only unless a future reviewed flag allows motion.
- Block behavior when privacy lock fails.
- Block behavior when transport state is unsafe.
- Rate-limit repeated celebration.
- Keep child/student safe mode conservative.
- Return neutral fallback on sensitive context or unknown action family.

The governor returns allow/deny/downgrade results with reason codes so future UI and QA can explain every action.
