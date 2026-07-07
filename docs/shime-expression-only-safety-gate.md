# Shime Expression-Only Safety Gate

## Purpose

The expression-only safety gate blocks unsafe robot-facing expression plans before any future robot integration.

## Gate Requirements

- No sensitive fields.
- No raw content.
- `dryRunOnly: true`.
- `sendStatus: not_sent`.
- `motionPolicy: locked`.
- Expression family must be allowed.
- No forbidden channel.
- No schedule mutation.
- No notification or calendar mutation.
- No transport connection.
- No robot send path.
- Reason codes present.

## Failure Behavior

Unsafe plans fail validation and must be blocked, neutralized, or converted to calm error/no-op before any future manual QA.

## Current Scope

This is pure validation and evidence. It does not send commands, connect to devices, or modify firmware.
