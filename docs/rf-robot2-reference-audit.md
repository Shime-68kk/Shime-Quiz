# RF Robot2 Reference Audit

Inspected read-only path: `/home/quang/Documents/PlatformIO/Projects/rf_robot2_ver2_stable`.

## Observed Direction

- Two-tier architecture: slow core state and fast reactive expression layer.
- Distance sensing via VL53L0X-style sensor abstraction.
- RF context using Wi-Fi signal and AP counts.
- OLED eyes and micro-expression rendering.
- Context classification from coarse distance/RF features.
- Dataset/training scripts and CSVs for robot context experiments.

## Risks

- Wi-Fi credential header exists in the robot project.
- RF monitor actively connects to Wi-Fi.
- Motor controller has real pin/PWM code behind compile-time gating.
- Hardware dependencies are not appropriate for direct import into Shime Quiz.
- The project is not complete enough to merge.

## Recommendation

Use it as reference for a future robot-body adapter. Do not merge source, credentials, build settings, datasets, or hardware control paths into this repository.
