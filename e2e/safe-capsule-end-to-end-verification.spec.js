import { expect, test } from '@playwright/test';

test('End-to-end mock verification passes and blocks checksum mismatch without bridge controls', async ({ page }) => {
  await page.goto('/settings');
  const panel = page.getByLabel('Xác minh App → Robot Mock — chưa kết nối thật');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Luồng này chỉ xác minh gói mock đã được robot mock import chấp nhận');
  await expect(panel).toContainText('Không kết nối robot thật');
  await expect(panel).toContainText('Không Serial/WebSocket/BLE/Wi-Fi');
  await expect(panel).toContainText('Bridge thật vẫn bị khóa');

  await panel.getByRole('button', { name: 'Tạo gói bàn giao mẫu' }).click();
  await panel.getByRole('button', { name: 'Tạo report mock khớp' }).click();
  await panel.getByRole('button', { name: 'Xác minh end-to-end' }).click();
  await expect(panel).toContainText('verified_pass');
  await expect(panel).toContainText('READY_FOR_MANUAL_ROBOT_MOCK_QA');
  await expect(panel).toContainText('transport disabledtrue');
  await expect(panel).toContainText('bridge lockedtrue');

  await panel.getByRole('button', { name: 'Tạo report lỗi checksum' }).click();
  await panel.getByRole('button', { name: 'Xác minh end-to-end' }).click();
  await expect(panel).toContainText('blocked_by_checksum');
  await expect(panel).toContainText('BLOCKED_CHECKSUM_MISMATCH');

  await expect(panel.getByRole('button', { name: /Send to robot|Gửi robot|Connect robot|Kết nối robot thật|Enable serial|Enable WebSocket/i })).toHaveCount(0);
  await expect(panel).not.toContainText(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/);
});
