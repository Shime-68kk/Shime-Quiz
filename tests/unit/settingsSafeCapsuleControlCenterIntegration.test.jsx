import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Settings Safe Capsule Control Center integration', () => {
  const settingsSource = () => fs.readFileSync(path.join(process.cwd(), 'src/routes/Settings.jsx'), 'utf8');
  const panelSource = () => fs.readFileSync(path.join(process.cwd(), 'src/components/settings/SafeCapsuleControlCenter.jsx'), 'utf8');

  it('Settings imports and renders SafeCapsuleControlCenter', () => {
    const source = settingsSource();

    expect(source).toMatch(/import SafeCapsuleControlCenter/);
    expect(source).toMatch(/<SafeCapsuleControlCenter \/>/);
  });

  it('does not auto-generate capsule on Settings page load', () => {
    const source = panelSource();

    expect(source).toMatch(/createInitialSafeCapsuleControlCenterState/);
    expect(source).not.toMatch(/useEffect\s*\(/);
    expect(source).not.toMatch(/CREATE_SAMPLE_STEADY[^]*useState/);
  });

  it('requires explicit controls and has no send button', () => {
    const source = panelSource();
    const viCopy = fs.readFileSync(path.join(process.cwd(), 'src/uiI18n/translations/vi.js'), 'utf8');

    expect(source).toContain("t('developer.createSteady')");
    expect(viCopy).toContain('Tạo capsule mẫu ổn định');
    expect(source).toMatch(/onClick=\{\(\) => runAction/);
    expect(source).not.toMatch(/Send to robot|Gửi robot|<button[^>]*>\s*Kết nối robot thật/i);
  });
});
