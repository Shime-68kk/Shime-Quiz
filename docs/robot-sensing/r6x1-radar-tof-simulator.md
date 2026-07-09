# R6X1 Radar + ToF Simulator

The simulator models coarse sensing states for ESP32-S3 + HLK-LD2410/LD2410B + VL53L0X without hardware access.

It covers:
- front user confirmation
- off-axis user presence
- rotated robot misalignment
- blocked ToF
- hand/object close to sensor
- quiet stationary study presence
- active user returning
- fan or curtain motion noise
- radar-only and ToF-only degraded modes

Run:

```sh
npm run test:robot-sensing-sim
node scripts/run-radar-tof-sensing-scenarios.js --scenario user_sits_off_axis_left
node scripts/run-radar-tof-sensing-scenarios.js --protocol
```

No camera/mic/cloud, no real bridge, no serial/WebSocket/BLE/Wi-Fi runtime bridge, and no firmware mutation are included.
