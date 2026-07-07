import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CompanionDevPanel from '../../src/components/settings/CompanionDevPanel.jsx';
import {
  runCompanionPanelScenario
} from '../../src/components/settings/companionDevPanelModel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const panelPath = resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx');
const modelPath = resolve(PROJECT_ROOT, 'src/components/settings/companionDevPanelModel.js');
const settingsPath = resolve(PROJECT_ROOT, 'src/routes/Settings.jsx');
const panelSource = fs.readFileSync(panelPath, 'utf8');
const modelSource = fs.readFileSync(modelPath, 'utf8');
const settingsSource = fs.readFileSync(settingsPath, 'utf8');

describe('CompanionDevPanel', () => {
  it('renders the dev-only fake facade warning and starts disabled', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    expect(html).toContain('Bảng thử nghiệm Trợ lý Đồng Hành — Chế độ Dev');
    expect(html).toContain('Chỉ dùng dữ liệu giả lập (Chỉ dành cho thử nghiệm)');
    expect(html).toContain('không gửi lệnh ra robot thật');
    expect(html).toContain('không dùng AI ngoại vi/cloud');
    expect(html).toContain('không lưu dữ liệu');
    expect(html).toContain('dữ liệu đã làm mờ/rút gọn');
    expect(html).toContain('Đã vô hiệu hóa');
    expect(html).toContain('Theo dõi Device Bridge thật — chỉ quan sát');
    expect(html).toContain('Đang tắt theo dõi');
    expect(html).toContain('Chưa đăng ký nhận');
    expect(html).toContain('Chưa có nhật ký suy luận');
    expect(html).not.toContain('Invalid Date');
  });

  it('contains explicit controls and no robot send button', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    [
      'Kích hoạt bảng thử nghiệm',
      'Vô hiệu hóa bảng thử nghiệm',
      'Buổi học bình thường',
      'Người học gặp khó',
      'Đến hạn ôn tập',
      'Lỗi kết nối',
      'Kiểm tra dữ liệu nhạy cảm',
      'Xóa nhật ký suy luận',
      'Bật theo dõi thật',
      'Tắt theo dõi thật',
      'Xóa nhật ký theo dõi',
      'Lệnh dự kiến — chỉ xem trước',
      'Các lệnh này chỉ là bản xem trước',
      'Tóm tắt đồng hành',
      'Nhịp học'
    ].forEach(text => expect(html).toContain(text));
    expect(html).not.toContain('Send robot');
    expect(html).not.toContain('Gửi lệnh');
    expect(html).not.toContain('Connect ESP32');
  });

  it('scenario buttons are disabled before explicit fake panel enable', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    expect(html).toMatch(/Buổi học bình thường<\/span><\/button>/);
    expect(html).toMatch(/button[^>]*disabled=""[^>]*><span>Buổi học bình thường/);
  });

  it('normal and struggle scenarios display safe companion decisions through the model', () => {
    const normal = runCompanionPanelScenario('normal_session', { enabled: true });
    const struggle = runCompanionPanelScenario('struggle_session', { enabled: true });

    expect(normal.transcript.some(entry => entry.companionIntent !== 'none')).toBe(true);
    expect(struggle.transcript.some(entry => entry.robotCommand === 'encourage')).toBe(true);
    expect(JSON.stringify([normal, struggle])).not.toContain('private text');
  });

  it('sensitive attack scenario is rejected without raw payload display', () => {
    const result = runCompanionPanelScenario('sensitive_attack', { enabled: true });
    const serialized = JSON.stringify(result);

    expect(result.rejectedCount).toBe(3);
    expect(result.blockedSensitiveCount).toBe(3);
    expect(serialized).toContain('đã chặn bởi lớp bảo mật');
    ['private text', 'private answer', 'sourceMetadata', 'backupPayload'].forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });
});

describe('CompanionDevPanel source safety', () => {
  it('is mounted in Settings as a separated dev-only panel', () => {
    expect(settingsSource).toContain("import CompanionDevPanel from '../components/settings/CompanionDevPanel.jsx';");
    expect(settingsSource).toContain('<CompanionDevPanel />');
  });

  it('imports Device Bridge only from the public API and does not import StudyRoom', () => {
    expect(panelSource).toContain("from '../../deviceBridge/index.js'");
    expect(panelSource).not.toContain('deviceBridge/deviceBridgeFacade');
    expect(panelSource).not.toContain('deviceBridge/deviceBridgeRuntime');
    expect(modelSource).not.toContain('deviceBridge');
    expect(panelSource).not.toMatch(/import\s+.*StudyRoom/);
    expect(modelSource).not.toMatch(/import\s+.*StudyRoom/);
    expect(panelSource).not.toContain('WebSocketTransport');
    expect(modelSource).not.toContain('WebSocketTransport');
  });

  it('does not call bridge emit or robot send APIs', () => {
    const combined = `${panelSource}\n${modelSource}`;

    expect(combined).not.toContain('emitStudyEvent');
    expect(combined).not.toContain('sendRobotCommand');
    expect(combined).not.toContain('connectMock');
    expect(combined).not.toContain('connectRealTransport');
    expect(combined).not.toContain('connectWebSocketTransport');
    expect(combined).not.toContain('new WebSocket');
    expect(combined).not.toContain('fetch(');
    expect(combined).not.toContain('XMLHttpRequest');
    expect(combined).not.toContain('localStorage');
    expect(combined).not.toContain('sessionStorage');
    expect(combined).not.toContain('indexedDB');
  });

  it('does not render sensitive fixture values in valid display output', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    ['private text', 'private answer', 'correctAnswer', 'sourceMetadata', 'studyHistory', 'backupPayload'].forEach(text => {
      expect(html).not.toContain(text);
    });
  });
});
