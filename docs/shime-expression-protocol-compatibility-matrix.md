# Shime Expression Protocol Compatibility Matrix

The compatibility matrix tracks the expression envelope version, learning capsule version, expression contract version, log-only contract version, and future firmware parser version.

Rules:

- Unknown major versions are rejected.
- Missing versions are rejected.
- Compatible minor versions can be accepted only if all safety gates still pass.
- Downgrade never unlocks features.
- Future versions default to reject until explicitly allowed.

