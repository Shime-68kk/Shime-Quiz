# R6X0 Radar + ToF Architecture

This is architecture and simulation only. It does not require real hardware, does not open serial ports, does not modify firmware, and does not enable a real bridge.

Target hardware direction: ESP32-S3 + HLK-LD2410/LD2410B + VL53L0X.

## Decision

Radar does not replace ToF. Radar handles wide presence and off-axis occupancy. ToF handles front/near confirmation and blocked-front detection. The combination is designed for non-expert users who may rotate the robot, block sensors, or use it in messy rooms.

## Privacy

No camera, no microphone, no cloud, no AI/API calls, and no identity inference. The app simulator only uses coarse buckets such as occupied, confidence bucket, distance bucket, and trend.

Future hardware work will validate real radar logs separately; this phase stores no hardware logs.
