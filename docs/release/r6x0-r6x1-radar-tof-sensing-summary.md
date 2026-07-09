# R6X0/R6X1 Radar + ToF Sensing Summary

Status: architecture/tooling/simulation only.

Added:
- pure radar + ToF fusion model
- deterministic scenario simulator
- CLI scenario runner
- real-world protocol generator
- docs, unit tests, and validator

Not added:
- real hardware access
- real bridge
- serial/WebSocket/BLE/Wi-Fi/cloud/backend
- camera or microphone
- AI/API calls
- firmware changes

Target future hardware stack: ESP32-S3 + HLK-LD2410/LD2410B + VL53L0X.
