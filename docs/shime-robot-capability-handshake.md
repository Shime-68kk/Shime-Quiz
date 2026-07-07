# Shime Robot Capability Handshake

## Purpose

The capability handshake is a future app to ESP32 schema for negotiating what expression channels a robot can safely support. It is schema-only in this phase.

## Current Safe Scope

- Pure object creation, validation, and summary.
- No runtime connection.
- No firmware change.
- No Wi-Fi setup data.
- No IP address, token, secret, SSID, or password.
- No robot command sending.

## Fields

The schema includes app/robot roles, protocol versions, capsule protocol version, expression contract version, expression channel capabilities, local bridge capability flags, motion support, `motionLocked`, privacy mode, safety mode, `dryRunOnly`, and `sendStatus`.

## Safety Rules

- Unknown versions are rejected as needing update.
- Motion support with unlocked motion fails.
- Missing motion lock fails.
- Unsupported capsule protocol fails.
- Sensitive fields fail.
- Output remains dry-run only.

## Future Scope

Real ESP32 negotiation must be implemented in a separate phase with firmware review, manual QA, and transport security review.
