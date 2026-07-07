import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('companionV2ManualQaReadiness', () => {
  it('has manual QA docs and avoids production integration claims', () => {
    const qa = fs.readFileSync('docs/cognitive-companion-v2-manual-qa.md', 'utf8');
    expect(qa).toContain('run fake normal scenario');
    expect(qa).toContain('run V2 dry-run');
    expect(qa).toContain('verify no send');
    expect(qa).toContain('F5 resets state');
    expect(qa).not.toContain('production enabled');
  });
});
