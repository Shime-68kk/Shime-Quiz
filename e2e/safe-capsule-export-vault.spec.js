import fs from 'node:fs';
import { expect, test } from '@playwright/test';

test('Safe Capsule Export Vault builds manual JSONL handoff without raw payloads', async ({ page }) => {
  await page.goto('/settings');
  const vault = page.getByLabel('Safe Capsule Export Vault — gói bàn giao thủ công');
  await expect(vault).toBeVisible();
  await expect(vault).toContainText('Bàn giao thủ công, không kết nối robot thật');
  await expect(vault).toContainText('Tạo JSONL mock import');
  await expect(vault).toContainText('Không Serial/WebSocket/BLE/Wi-Fi');
  await expect(vault).toContainText('Không xuất câu hỏi/đáp án/lịch sử học');

  await vault.getByRole('button', { name: 'Thêm tất cả mẫu an toàn' }).click();
  await vault.getByRole('button', { name: 'Tạo gói JSONL bàn giao' }).click();
  await expect(vault).toContainText('R5X19.2_SAFE_MOCK_IMPORT_READY');
  await expect(vault).toContainText('/SHIME_EXTERNAL_CAPSULE_MOCK/imports.jsonl');
  await expect(vault).toContainText(/checksum32[a-f0-9]{8}/);
  await vault.getByRole('button', { name: 'Xác minh gói bàn giao' }).click();
  await expect(vault).toContainText('valid');

  await vault.getByRole('button', { name: 'Sao chép JSONL' }).click();
  await expect(vault.getByRole('button', { name: 'Sao chép JSONL' })).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await vault.getByRole('button', { name: 'Tải JSONL' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^shime-safe-capsule-.*\.jsonl$/);
  const path = await download.path();
  const text = fs.readFileSync(path, 'utf8');
  expect(text).toContain('shime_robot_mock_import_package');
  expect(text).toContain('R5X19.2_SAFE_MOCK_IMPORT');
  expect(text).not.toMatch(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/);

  await expect(vault.getByRole('button', { name: /Send to robot|Gửi robot|Connect robot|Kết nối robot thật/i })).toHaveCount(0);
  await expect(vault).not.toContainText(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/);
});
