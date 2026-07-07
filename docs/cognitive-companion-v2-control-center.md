# Cognitive Companion V2 Control Center

The Companion Control Center now includes a dev-only V2 section titled `C. Não đồng hành V2 — chạy thử khô`.

## What It Does

- Reads only the current sanitized transcript shown in the Control Center.
- Runs the Companion Cognitive Engine V2 in dry-run mode.
- Shows V2 intent, planned command family, safety status, quality score, invariant status, and reason codes.
- Optionally compares the existing Control Center output with V2 output.

## What It Does Not Do

- It does not run automatically.
- It does not subscribe to Device Bridge.
- It does not send commands to a robot.
- It does not change study results.
- It does not use AI/cloud.
- It does not store data.
- It does not render raw quiz payloads.

## How To Use

1. Enable the dev panel or live observe-only tap.
2. Generate or observe a sanitized transcript.
3. Click `Chạy V2 trên nhật ký hiện tại`.
4. Confirm every V2 row says dry-run / `not_sent`.
5. Use `Xóa kết quả V2` to clear the V2 panel result.

## Manual QA Expectation

The V2 section is ready only for local manual QA. It remains dev-only, explicit-click, dry-run, and non-persistent.
