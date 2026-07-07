# Cognitive Companion Replay Benchmark

Date: 2026-06-27 09:35:19 +07

Run:

```bash
node tools/deviceBridge/companionReplayBenchmark.mjs
```

The benchmark runs 18 redacted/coarse scenarios through the V2 simulation engine and prints scenario name, event count, final intent, final command, quality score, safety result, privacy result, and pass/fail.

Sensitive/malformed scenarios are expected to fail safely or be blocked without leaking payloads.

