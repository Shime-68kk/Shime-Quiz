import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CompanionDevPanel from '../../../src/components/settings/CompanionDevPanel.jsx';
import { runCompanionPanelScenario } from '../../../src/components/settings/companionDevPanelModel.js';
import { runShimeFusionPanelDryRun } from '../../../src/components/settings/shimeEcosystemFusionPanelAdapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../..');
const panelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx'), 'utf8');
const adapterSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/shimeEcosystemFusionPanelAdapter.js'), 'utf8');

describe('shimeEcosystemControlCenterIntegration', () => {
  it('renders Section D without auto-running fusion output', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);
    expect(html).toContain('D. Hệ sinh thái Shime — chạy thử khớp nối');
    expect(html).toContain('Chạy khớp nối Shime');
    expect(html).toContain('Xóa kết quả khớp nối');
    expect(html).toContain('Chưa chạy khớp nối Shime trong phiên hiển thị hiện tại.');
    expect(html).not.toContain('Áp lực trí nhớ</span><strong');
  });

  it('uses explicit click wiring and no send button text', () => {
    expect(panelSource).toContain('onClick={handleRunShimeFusion}');
    expect(panelSource).toContain('onClick={handleClearShimeFusion}');
    expect(panelSource).not.toContain('Gửi lệnh');
    expect(panelSource).not.toContain('Send robot');
  });

  it('runs Shime fusion from fake transcript and keeps output UI-safe', () => {
    const fake = runCompanionPanelScenario('struggle_session', { enabled: true });
    const result = runShimeFusionPanelDryRun(fake.transcript);
    expect(result.empty).toBe(false);
    expect(result.snapshot.memoryPressureLabel).toBeTruthy();
    expect(result.snapshot.robotInterventionLabel).toBeTruthy();
    expect(result.snapshot.timetableRecommendationLabel).toBeTruthy();
    expect(result.snapshot.transportRecommendationLabel).toBeTruthy();
    expect(result.snapshot.dryRunOnly).toBe(true);
    expect(result.snapshot.sendStatus).toBe('not_sent');
  });

  it('neutralizes sensitive transcript rows', () => {
    const attack = runCompanionPanelScenario('sensitive_attack', { enabled: true });
    const result = runShimeFusionPanelDryRun(attack.transcript);
    expect(result.snapshot.privacyStatusLabel).toBe('đã chặn');
    expect(result.snapshot.capsuleStatusLabel).toBe('capsule đã chặn');
    expect(JSON.stringify(result)).not.toContain('private text');
  });

  it('does not import StudyRoom, DeviceBridge runtime, storage, network, or AI APIs', () => {
    const source = `${panelSource}\n${adapterSource}`;
    expect(adapterSource).not.toContain('deviceBridge');
    expect(source).not.toMatch(/import\s+.*StudyRoom/);
    expect(source).not.toContain('deviceBridgeRuntime');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('XMLHttpRequest');
    expect(source).not.toContain('OPENAI');
    expect(source).not.toContain('ANTHROPIC');
    expect(source).not.toContain('GEMINI');
    expect(source).not.toContain('sendRobotCommand');
    expect(source).not.toContain('emitStudyEvent');
  });
});
