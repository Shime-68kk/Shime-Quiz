# Shime ESP32 Expression Log-Only Contract

This contract is a preview of what future ESP32 firmware could log after receiving a valid expression envelope. It does not modify firmware and does not describe current firmware behavior.

The log-only preview records accepted/rejected status, expression family, display expression, LED pattern, sound cue, locked motion policy, dry-run status, privacy status, safety status, and reason codes.

The preview must reject unsupported protocol versions, unsafe message types, unlocked motion, sent status, unsafe channels, and unsafe payload keys. It never maps to pins, motors, servos, network calls, or real robot motion.

