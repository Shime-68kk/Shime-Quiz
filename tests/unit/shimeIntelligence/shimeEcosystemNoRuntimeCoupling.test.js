import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('shimeEcosystemNoRuntimeCoupling', () => {
  it('core modules avoid StudyRoom, DeviceBridge runtime, React, storage, network, AI, notification, and calendar APIs', () => {
    const files = fs.readdirSync('src/shimeIntelligence').filter(file => file.endsWith('.js')).map(file => `src/shimeIntelligence/${file}`);
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/from ['"].*StudyRoom|from ['"].*deviceBridge|from ['"].*DeviceBridge|from ['"]react|document\.|window\.|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocketTransport|OPENAI|ANTHROPIC|GEMINI|API_KEY|sendRobotCommand|emitStudyEvent|new Notification|Notification\.requestPermission|navigator\.bluetooth|navigator\.serial/);
    expect(source).toContain('calendarMutationAllowed: false');
    expect(source).not.toContain('calendarMutationAllowed: true');
  });
});
