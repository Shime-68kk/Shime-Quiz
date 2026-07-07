# Robot Core Fusion Strategy

External reference inspected read-only: `/home/quang/Documents/PlatformIO/Projects/rf_robot2_ver2_stable`.

## Reference Findings

- Sensor concept: VL53L0X distance sensing plus RF/Wi-Fi context signals.
- Presence concept: distance averages, approach velocity, hand-wave style signals, and coarse human-near classification.
- Reactive layer concept: fast micro-expression overlay that does not drive the slower core state machine.
- Display/eyes concept: OLED robot eyes with neutral, happy, attention, curious, surprised, tired, and blink states.
- Motion concept: motor controller exists with compile-time `MOTOR_ENABLED` gate, but the project contains real pin/PWM paths when enabled.
- Credentials hygiene risk: a `credentials.h` path exists in the external project. No credentials were copied.

## Why Not Merge Directly

The reference project has active Wi-Fi/RF code, optional real motor control, hardware-specific display/sensor dependencies, and local credential boundaries. It is valuable as a robot-body direction, not as app code.

## Target Fusion

```text
Shime companion kernel -> safe companion intent
Robot local sensors -> coarse presence state
Safety governor -> allow/downgrade/deny
Robot core adapter -> expression/log-only action first
```

The robot core may stay autonomous for local reactions, but must obey an external safety lock for any Shime-driven action.
