import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

describe('DeviceBridgeUiConcept static check', () => {
  const panelPath = resolve(PROJECT_ROOT, 'src/components/settings/DeviceBridgeUiConcept.jsx');
  const source = fs.readFileSync(panelPath, 'utf8');

  it('contains the UI title and description', () => {
    expect(source).toContain('Device Bridge');
    expect(source).toContain('Kết nối thiết bị đồng hành');
  });

  it('contains clear privacy warnings minimizing data exposure', () => {
    expect(source).toContain('⚠️ Cam kết bảo mật dữ liệu học tập');
    expect(source).toContain('chỉ chia sẻ thông tin tiến độ và trạng thái đúng/sai dạng rút gọn');
    expect(source).toMatch(/tuyệt đối[\s\S]*không gửi[\s\S]*nội dung câu hỏi, đáp án/);
    expect(source).toContain('getDeviceBridgePrivacyWarning');
  });

  it('contains a disabled state message', () => {
    expect(source).toContain('Tính năng kết nối thiết bị đang tắt');
  });

  it('contains the state controls', () => {
    expect(source).toContain('Trạng thái:');
    expect(source).toContain('Chưa kết nối');
    expect(source).toContain('Đã kết nối (Real LAN / WS)');
    expect(source).toContain('Đã kết nối (Thiết bị Mock)');
    expect(source).toContain('Kết nối thiết bị Mock');
    expect(source).toContain('Ngắt kết nối');
    expect(source).toContain('Xóa nhật ký');
    expect(source).toContain('[Chưa có sự kiện] Kết nối thiết bị để xem nhật ký sự kiện.');
  });

  it('verifies that no demo emit buttons or triggers exist', () => {
    expect(source).toContain('getSharedDeviceBridgeFacade');
    expect(source).not.toContain('createDeviceBridgeFacade');
    expect(source).not.toContain('demo session_started');
    expect(source).not.toContain('demo question_presented');
    expect(source).not.toContain('demo answer_correct');
    expect(source).not.toContain('demo answer_wrong');
    expect(source).not.toContain('demo session_complete');
    expect(source).not.toContain('triggerDemoEvent');
    expect(source).not.toContain('emitStudyEvent');
  });

  it('keeps shared runtime controls manual and does not auto-connect', () => {
    const effectBlock = source.slice(source.indexOf('useEffect(() => {'), source.indexOf('  const handleToggleBridge'));

    expect(source).toContain('const handleToggleBridge = () =>');
    expect(source).toContain('facade.enable();');
    expect(source).toContain('const handleConnectMock = () =>');
    expect(source).toContain('facade.connectMock();');
    expect(source).toMatch(/onClick=\{handleToggleBridge\}/);
    expect(source).toMatch(/onClick=\{handleConnectMock\}/);
    expect(effectBlock).not.toContain('facade.connectMock()');
    expect(effectBlock).not.toContain('facade.enable()');
  });

  it('verifies that no forbidden payload fields exist in the source code', () => {
    expect(source).not.toContain('itemCount');
    expect(source).not.toContain('studyMode');
    expect(source).not.toContain('answeredCount');
    expect(source).not.toContain('correctCount');
    expect(source).not.toContain('wrongCount');
    expect(source).not.toContain('unansweredCount');
    expect(source).not.toContain('unscoredCount');
  });
});

describe('DeviceBridgeUiConcept forbidden patterns verification', () => {
  const panelPath = resolve(PROJECT_ROOT, 'src/components/settings/DeviceBridgeUiConcept.jsx');
  const source = fs.readFileSync(panelPath, 'utf8');

  it('does not write to localStorage directly', () => {
    expect(source).not.toContain('localStorage.setItem');
    expect(source).not.toContain('localStorage.removeItem');
  });

  it('does not contain network protocol code or web sockets', () => {
    expect(source).not.toContain('new WebSocket');
    expect(source).not.toContain('mqtt.connect');
    expect(source).not.toContain('navigator.bluetooth');
  });

  it('does not contain hardcoded device IP addresses', () => {
    expect(source).not.toMatch(/const\s+\w+\s*=\s*['"]192\.168\./);
  });
});

import { formatEventTime } from '../../src/components/settings/DeviceBridgeUiConcept.jsx';

describe('formatEventTime timestamp formatting helper', () => {
  it('formats a valid ISO timestamp to locale time string without rendering Invalid Date', () => {
    const isoString = '2026-06-27T01:22:20.000Z';
    const result = formatEventTime(isoString);
    expect(result).not.toBe('—');
    expect(result).not.toBe('Invalid Date');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns fallback for null/undefined/empty string', () => {
    expect(formatEventTime(null)).toBe('—');
    expect(formatEventTime(undefined)).toBe('—');
    expect(formatEventTime('')).toBe('—');
  });

  it('returns fallback for invalid ISO timestamp strings', () => {
    expect(formatEventTime('not-a-date')).toBe('—');
    expect(formatEventTime('2026-99-99T99:99:99')).toBe('—');
  });
});
