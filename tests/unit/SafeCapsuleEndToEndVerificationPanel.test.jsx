import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SafeCapsuleEndToEndVerificationPanel from '../../src/components/settings/SafeCapsuleEndToEndVerificationPanel.jsx';

describe('SafeCapsuleEndToEndVerificationPanel', () => {
  it('renders mock-only bridge-locked copy and controls', () => {
    const html = renderToStaticMarkup(<SafeCapsuleEndToEndVerificationPanel />);
    expect(html).toContain('Xác minh App');
    expect(html).toContain('Không kết nối robot thật');
    expect(html).toContain('Không Serial/WebSocket/BLE/Wi-Fi');
    expect(html).toContain('Bridge thật vẫn bị khóa');
    expect(html).toContain('Tạo gói bàn giao mẫu');
  });
  it('does not render send/connect controls or raw values', () => {
    const html = renderToStaticMarkup(<SafeCapsuleEndToEndVerificationPanel />);
    expect(html).not.toMatch(/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật|Enable serial|Enable WebSocket)/i);
    expect(html).not.toMatch(/private question|private answer|HomeNetwork|secret-token|card_private/);
  });
  it('source has no storage/network/transport APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/components/settings/SafeCapsuleEndToEndVerificationPanel.jsx'), 'utf8');
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|new\s+WebSocket/i);
  });
});
