# Shime ESP32 Expression Rollback Plan

Future firmware changes must stay isolated so rollback is simple:

1. Restore previous protocol files.
2. Rebuild the PlatformIO baseline.
3. Rerun serial QA vectors.
4. Disable parser path if unsafe.
5. Keep app runtime independent from firmware parser behavior.

Rollback must never require network, credentials, motion, or app storage changes.

