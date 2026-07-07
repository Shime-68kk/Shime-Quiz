import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SafeCapsuleExportVault from '../../src/components/settings/SafeCapsuleExportVault.jsx';

describe('SafeCapsuleExportVault', () => {
  it('renders manual handoff copy and controls', () => {
    const html = renderToStaticMarkup(<SafeCapsuleExportVault />);
    expect(html).toContain('Safe Capsule Export Vault');
    expect(html).toContain('Bàn giao thủ công, không kết nối robot thật');
    expect(html).toContain('Tạo JSONL mock import');
    expect(html).toContain('Không lưu tự động trong trình duyệt');
    expect(html).toContain('Thêm tất cả mẫu an toàn');
    expect(html).toContain('Tải JSONL');
  });

  it('does not render send/connect buttons or raw values', () => {
    const html = renderToStaticMarkup(<SafeCapsuleExportVault />);
    expect(html).not.toMatch(/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i);
    expect(html).not.toMatch(/private question|private answer|HomeNetwork|secret-token|card_private/);
  });

  it('source has no storage/network/transport APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/components/settings/SafeCapsuleExportVault.jsx'), 'utf8');
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|new\s+WebSocket/i);
    expect(source).toMatch(/Blob/);
    expect(source).toMatch(/URL\.createObjectURL/);
  });
});
