# Shime ESP32 Expression Parser Design

The future parser should read one newline-delimited JSON envelope per line with a bounded message size.

It must validate required fields, protocol version, expression family, channels, locked motion, dry-run state, not-sent state, and nested forbidden keys. Unsupported versions must reject by default.

The parser must be log-only. It must not control pins, motors, servos, radio transports, app state, or study data.

