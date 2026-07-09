import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runRadarTofSensingCli } from '../../scripts/run-radar-tof-sensing-scenarios.js';

describe('run-radar-tof-sensing-scenarios script', () => {
  it('runs all scenarios and json output', () => {
    const result = runRadarTofSensingCli(['--all', '--json']);
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.stdout).scenarios.length).toBe(14);
  });
  it('prints protocol safely', () => {
    const result = runRadarTofSensingCli(['--protocol']);
    expect(result.ok).toBe(true);
    expect(result.stdout).toContain('front_user_60cm');
  });
  it('script source has no hardware or network APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts/run-radar-tof-sensing-scenarios.js'), 'utf8');
    expect(source).not.toMatch(/navigator\.serial|navigator\.bluetooth|WebSocket|fetch\s*\(|XMLHttpRequest|SerialPort|getUserMedia|MediaRecorder/i);
  });
});
