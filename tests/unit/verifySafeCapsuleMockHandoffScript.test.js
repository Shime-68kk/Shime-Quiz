import { describe, expect, it } from 'vitest';
import { verifySafeCapsuleMockHandoffCliResult } from '../../scripts/verify-safe-capsule-mock-handoff.js';

describe('verify-safe-capsule-mock-handoff script', () => {
  it('passes demo pass and fails checksum demo with safe stdout', () => {
    const pass = verifySafeCapsuleMockHandoffCliResult(['--demo-pass']);
    expect(pass.ok).toBe(true);
    expect(pass.stdout).toContain('verified_pass');
    const fail = verifySafeCapsuleMockHandoffCliResult(['--demo-fail-checksum']);
    expect(fail.ok).toBe(false);
    expect(fail.stdout).toContain('BLOCKED_CHECKSUM_MISMATCH');
    expect(`${pass.stdout}${fail.stdout}`).not.toMatch(/private question|HomeNetwork|secret-token/);
  });
});
