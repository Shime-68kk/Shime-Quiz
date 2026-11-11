import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ShimeRobotPresence from '../../src/components/brand/ShimeRobotPresence.jsx';
import ShimeStudyCompanion, { getStudyCompanionExpression } from '../../src/components/study/ShimeStudyCompanion.jsx';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const css = read('src/styles/global.css');
const tokens = read('src/design-system/tokens.css');
const studyCompanionSource = read('src/components/study/ShimeStudyCompanion.jsx');

describe('BIG-UPDATE-14 embodied robot expressions', () => {
  it('maps only coarse study reactions to canonical expressions', () => {
    expect(getStudyCompanionExpression('neutral')).toBe('attentive');
    expect(getStudyCompanionExpression('correct')).toBe('correct');
    expect(getStudyCompanionExpression('incorrect')).toBe('incorrect');
    expect(getStudyCompanionExpression('completed')).toBe('complete');
    for (const forbidden of ['prompt', 'correctAnswer', 'userAnswer', 'explanation', 'rawQuizPayload', 'importedDocumentText']) {
      expect(studyCompanionSource).not.toContain(forbidden);
    }
  });

  it('renders larger StudyRoom presence with localized text-equivalent support', () => {
    const html = renderToStaticMarkup(
      <ShimeStudyCompanion reaction="incorrect" message="Review the answer." label="Study companion" />
    );
    expect(html).toContain('data-robot-size="large"');
    expect(html).toContain('data-oled-viewbox="0 0 128 64"');
    expect(html).toContain('data-robot-expression="incorrect"');
    expect(html).toContain('data-study-companion-reaction="incorrect"');
    expect(html).toContain('aria-label="Study companion"');
    expect(html).toContain('Review the answer.');
  });

  it('keeps feedback motion one-shot and idle motion deterministic CSS only', () => {
    expect(css).toMatch(/shimeOledIdleBlink 5\.8s linear infinite/);
    expect(css).toMatch(/shimeOledHeadFloat 4\.8s ease-in-out infinite/);
    expect(css).toMatch(/shimeOledHappyResponse 340ms[\s\S]*? 1;/);
    expect(css).toMatch(/shimeOledSympatheticResponse 400ms ease-out 1;/);
    expect(css).toContain("data-robot-size='medium'");
    expect(css).toContain("data-robot-size='large'");
    expect(css).not.toContain("data-robot-size='compact'] .shimeRobotHead");
    expect(studyCompanionSource).not.toMatch(/setTimeout|setInterval|Math\.random|requestAnimationFrame/);
  });

  it('preserves theme identity for correct and incorrect expressions', () => {
    for (const expression of ['correct', 'incorrect']) {
      const html = renderToStaticMarkup(<ShimeRobotPresence expression={expression} motion="feedback" />);
      expect(html).toContain(`data-robot-expression="${expression}"`);
    }
    expect(css).not.toMatch(/shimeRobotHead--(?:correct|incorrect)[^}]*theme-status-(?:safe|danger)/);
    expect(css).not.toMatch(/shimeRobotPresence--(?:success|warning)[^}]*--shime-eye-color/);
  });

  it('defines every robot semantic role for every theme and disables all motion when requested', () => {
    const roles = ['shell', 'shell-elevated', 'shell-border', 'eye', 'eye-soft', 'glow', 'shadow', 'message-surface'];
    for (const role of roles) {
      expect(tokens.match(new RegExp(`--theme-robot-${role}:`, 'g'))).toHaveLength(5);
    }
    expect(css).toMatch(/prefers-reduced-motion:[\s\S]*?\.shimeRobotPresence \.shimeRobotHead,[\s\S]*?animation: none !important/);
    const reduced = renderToStaticMarkup(<ShimeRobotPresence expression="incorrect" motion="feedback" reducedMotion />);
    expect(reduced).toContain('shimeRobotPresence--reduced-motion');
    expect(reduced).toContain('data-robot-expression="incorrect"');
  });
});
