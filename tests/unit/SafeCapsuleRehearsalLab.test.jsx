import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SafeCapsuleRehearsalLab from '../../src/components/settings/SafeCapsuleRehearsalLab.jsx';

describe('SafeCapsuleRehearsalLab', () => {
  it('renders Vietnamese-first mock rehearsal copy and explicit controls', () => {
    const html = renderToStaticMarkup(<SafeCapsuleRehearsalLab />);

    expect(html).toContain('Safe Capsule Rehearsal Lab');
    expect(html).toContain('diễn tập mock');
    expect(html).toContain('Diễn tập nhiều trạng thái học mà không gửi robot thật');
    expect(html).toContain('Không Serial/WebSocket/BLE/Wi-Fi');
    expect(html).toContain('Không xuất câu hỏi/đáp án/lịch sử học');
    expect(html).toContain('Chỉ sinh bằng chứng quyền riêng tư và gói mock import');
    expect(html).toContain('Chạy diễn tập ổn định');
    expect(html).toContain('Chạy toàn bộ diễn tập');
  });

  it('does not auto-render results or send/connect controls on initial render', () => {
    const html = renderToStaticMarkup(<SafeCapsuleRehearsalLab />);

    expect(html).toContain('Chưa có kết quả diễn tập');
    expect(html).not.toMatch(/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i);
    expect(html).not.toMatch(/private question|private answer|HomeNetwork|secret-token|deck_private/);
  });

  it('source does not import browser storage, network, or transport APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/components/settings/SafeCapsuleRehearsalLab.jsx'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|new\s+WebSocket|mqtt/i);
  });
});
