import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CompanionDevPanel from '../../../src/components/settings/CompanionDevPanel.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../..');
const panelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx'), 'utf8');

describe('shimeExpressionControlCenterIntegration', () => {
  it('renders expression preview section without auto-run output or forbidden controls', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);
    expect(html).toContain('Robot Shime — xem trước biểu cảm');
    expect(html).toContain('Chạy xem trước biểu cảm');
    expect(html).toContain('Xóa xem trước biểu cảm');
    expect(html).toContain('Chưa chạy xem trước biểu cảm');
    expect(html).toContain('Bảng giả lập Robot Shime');
    expect(html).not.toContain('Gửi lệnh');
    expect(html).not.toContain('Kết nối robot');
  });

  it('uses explicit click handlers and keeps V2 labels visible', () => {
    expect(panelSource).toContain('onClick={handleRunRobotExpressionPreview}');
    expect(panelSource).toContain('onClick={handleClearRobotExpressionPreview}');
    expect(renderToStaticMarkup(<CompanionDevPanel />)).toContain('C. Não đồng hành V2');
  });
});
