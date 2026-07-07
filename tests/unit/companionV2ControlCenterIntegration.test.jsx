import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CompanionDevPanel from '../../src/components/settings/CompanionDevPanel.jsx';
import { runCompanionPanelScenario } from '../../src/components/settings/companionDevPanelModel.js';
import { runV2DryRunFromTranscript } from '../../src/components/settings/companionV2PanelAdapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const panelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx'), 'utf8');

describe('companion V2 Control Center integration', () => {
  it('renders V2 section but does not run V2 on page load', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);
    expect(html).toContain('C. Não đồng hành V2 — chạy thử khô');
    expect(html).toContain('Chạy V2 trên nhật ký hiện tại');
    expect(html).toContain('Chưa có nhật ký để chạy V2');
    expect(html).toContain('V2 chưa chạy');
    expect(html).not.toContain('Trạng thái invariant</span><strong');
  });

  it('fake scenario can feed V2 dry-run without send controls or raw payload display', () => {
    const scenario = runCompanionPanelScenario('normal_session', { enabled: true });
    const v2 = runV2DryRunFromTranscript(scenario.transcript);
    const serialized = JSON.stringify(v2);
    expect(v2.rows.length).toBeGreaterThan(0);
    expect(v2.rows.every(row => row.dryRunOnly === true && row.sendStatus === 'not_sent')).toBe(true);
    expect(serialized).not.toContain('payload');
    expect(panelSource).not.toContain('sendRobotCommand');
    expect(panelSource).not.toContain('emitStudyEvent');
    expect(panelSource).not.toContain('Gửi lệnh');
  });

  it('keeps existing fake and live observe modes explicit', () => {
    expect(panelSource).toContain('Bật theo dõi thật');
    expect(panelSource).toContain('Kích hoạt bảng thử nghiệm');
    expect(panelSource).toContain('handleRunV2DryRun');
  });
});
