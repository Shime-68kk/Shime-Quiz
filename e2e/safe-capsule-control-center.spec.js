import { expect, test } from '@playwright/test';

test('Safe Capsule Control Center is mock-only and creates safe previews', async ({ page }) => {
  await page.goto('/settings');

  const panel = page.getByLabel('Trung tâm Safe Capsule — chỉ mô phỏng');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Trung tâm Safe Capsule — chỉ mô phỏng');
  await expect(panel).toContainText('Không kết nối robot thật');
  await expect(panel).toContainText('Không gửi Serial/WebSocket/BLE/Wi-Fi');
  await expect(panel).toContainText('Không xuất câu hỏi/đáp án/lịch sử học');
  await expect(panel).toContainText('mock_only_not_connected');
  await expect(panel).toContainText('Chưa có capsule preview');

  await panel.getByRole('button', { name: 'Tạo capsule mẫu ổn định' }).click();
  await expect(panel).toContainText('STEADY_PROGRESS');
  await expect(panel).toContainText(/checksum/i);
  await expect(panel).toContainText('redacted_coarse_only');

  await panel.getByRole('button', { name: 'Chạy kiểm tra quyền riêng tư' }).click();
  await expect(panel).toContainText('Không phát hiện câu hỏi/prompt thô');
  await expect(panel).toContainText('Không phát hiện đáp án hoặc câu trả lời người dùng');
  await expect(panel).toContainText('Không phát hiện lịch sử học thô');
  await expect(panel).toContainText('Không phát hiện SSID/BSSID/MAC/AP thô');

  await panel.getByRole('button', { name: 'Tạo gói mock robot import' }).click();
  await expect(panel).toContainText('R5X19.2_SAFE_MOCK_IMPORT');
  await expect(panel).toContainText('mock_only');
  await expect(panel).toContainText('compatible');

  await expect(panel.getByRole('button', { name: /Send to robot|Gửi robot|Connect robot|Kết nối robot thật/i })).toHaveCount(0);
  await expect(panel).not.toContainText(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/);
});
