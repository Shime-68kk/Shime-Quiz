import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SafeCapsuleControlCenter from '../../src/components/settings/SafeCapsuleControlCenter.jsx';
import {
  applySafeCapsuleControlCenterAction,
  SAFE_CAPSULE_CONTROL_CENTER_ACTIONS
} from '../../src/components/settings/safeCapsuleControlCenterModel.js';
import { computeSafeLearningCapsuleChecksum } from '../../src/deviceBridge/safeLearningCapsule.js';

describe('SafeCapsuleControlCenter', () => {
  it('renders Vietnamese-first mock-only safety copy and sample controls', () => {
    const html = renderToStaticMarkup(<SafeCapsuleControlCenter />);

    expect(html).toContain('Trung tâm Safe Capsule');
    expect(html).toContain('chỉ mô phỏng');
    expect(html).toContain('Không kết nối robot thật');
    expect(html).toContain('Không gửi Serial/WebSocket/BLE/Wi-Fi');
    expect(html).toContain('Không xuất câu hỏi/đáp án/lịch sử học');
    expect(html).toContain('Tạo capsule mẫu ổn định');
    expect(html).toContain('Tạo capsule mẫu đang gặp khó');
    expect(html).toContain('Tạo capsule áp lực ôn tập cao');
    expect(html).toContain('Tạo capsule năng lượng thấp');
    expect(html).toContain('Chạy kiểm tra quyền riêng tư');
    expect(html).toContain('Tạo gói mock robot import');
    expect(html).toContain('mock_only_not_connected');
  });

  it('model click path creates safe preview, audit, and mock package summary', () => {
    let state = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY);
    state = applySafeCapsuleControlCenterAction(state, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.RUN_PRIVACY_AUDIT);
    state = applySafeCapsuleControlCenterAction(state, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_MOCK_ROBOT_IMPORT_PACKAGE);

    expect(state.capsule.checksum).toBe(computeSafeLearningCapsuleChecksum(state.capsule));
    expect(state.privacyAudit.rawQuizFieldsDetected).toBe(false);
    expect(state.mockPackageSummary.checksumStatus).toBe('valid');
    expect(state.mockPackageSummary.compatibleWithR5X19_2).toBe(true);
  });

  it('does not render send/connect robot controls or raw field names', () => {
    const html = renderToStaticMarkup(<SafeCapsuleControlCenter />);

    expect(html).not.toMatch(/<button[^>]*>[^<]*(Send to robot|Gửi robot|Connect robot|Kết nối robot thật)/i);
    expect(html).not.toMatch(/prompt|correctAnswer|userAnswer|studyHistory|sourceMetadata|cardId|deckId|SSID|BSSID|MAC|token|secret|password/);
  });

  it('source does not import network, serial, or browser storage APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/components/settings/SafeCapsuleControlCenter.jsx'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|new\s+WebSocket|mqtt/i);
  });
});
