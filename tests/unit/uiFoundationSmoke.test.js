import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveMobileGestureIntent } from '../../src/studyRoom/mobileGestureIntentModel.js';
import { resolveStudyRoomSwipeGesture } from '../../src/studyRoom/studyRoomSwipeGesture.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('BIG-UPDATE-9 UI foundation smoke', () => {
  it('keeps mobile gesture model biased toward vertical scrolling unless horizontal intent is clear', () => {
    const vertical = resolveMobileGestureIntent({
      deltaX: 30,
      deltaY: 90,
      elapsedMs: 180,
      pointerType: 'touch',
      viewportWidth: 390
    });
    expect(vertical.shouldPreserveVerticalScroll).toBe(true);
    expect(vertical.shouldNavigateHorizontally).toBe(false);
    expect(resolveStudyRoomSwipeGesture({
      startX: 20,
      startY: 20,
      endX: 50,
      endY: 120,
      elapsedMs: 180,
      pointerType: 'touch',
      viewportWidth: 390
    })).toBe('none');
  });

  it('keeps StudyRoom mobile CSS guardrails in place', () => {
    const css = read('src/styles/global.css');
    expect(css).toContain('touch-action: pan-y');
    expect(css).toContain('scroll-snap-type: x proximity');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('studyQuestionSoftIn 0.18s ease-out both');
  });

  it('documents global CSS as a high-risk foundation area before premium UI polish', () => {
    const audit = read('docs/reports/big-update-9-ui-foundation-audit.md');
    const finalReport = read('docs/reports/big-update-9-architecture-foundation-final-report.md');
    expect(audit).toMatch(/global\.css.*6123 lines/i);
    expect(finalReport).toContain('Global CSS risk level: high');
    expect(finalReport).toContain('Future premium UI phase recommended: yes');
  });
});
