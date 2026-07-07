import { expect, test } from '@playwright/test';

test('Safe Capsule Rehearsal Lab runs mock scenarios without raw payloads or send controls', async ({ page }) => {
  await page.goto('/settings');

  const lab = page.getByLabel('Safe Capsule Rehearsal Lab — diễn tập mock');
  await expect(lab).toBeVisible();
  await expect(lab).toContainText('Diễn tập nhiều trạng thái học mà không gửi robot thật');
  await expect(lab).toContainText('Không Serial/WebSocket/BLE/Wi-Fi');
  await expect(lab).toContainText('Không xuất câu hỏi/đáp án/lịch sử học');
  await expect(lab).toContainText('Chỉ sinh bằng chứng quyền riêng tư và gói mock import');
  await expect(lab).toContainText('mock_only_not_connected');
  await expect(lab).toContainText('no_send_preview_only');

  await lab.getByRole('button', { name: 'Chạy diễn tập ổn định' }).click();
  await expect(lab).toContainText('steady_progress');
  await expect(lab).toContainText('accepted');
  await expect(lab).toContainText('STEADY_PROGRESS');
  await expect(lab).toContainText('CHECKSUM_VALID');

  await lab.getByRole('button', { name: 'Chạy kiểm tra tấn công dữ liệu quiz' }).click();
  await expect(lab).toContainText('privacy_attack_raw_quiz');
  await expect(lab).toContainText('rejected');
  await expect(lab).toContainText('REJECTED_FOR_RAW_QUIZ');
  await expect(lab.getByRole('row').filter({ hasText: 'privacy_attack_raw_quiz' })).toContainText('no');

  await lab.getByRole('button', { name: 'Chạy toàn bộ diễn tập' }).click();
  await expect(lab.getByRole('cell', { name: 'steady_progress', exact: true })).toBeVisible();
  await expect(lab.getByRole('cell', { name: 'low_energy_focus', exact: true })).toBeVisible();
  await expect(lab.getByRole('cell', { name: 'privacy_attack_secret', exact: true })).toBeVisible();

  await expect(lab.getByRole('button', { name: /Send to robot|Gửi robot|Connect robot|Kết nối robot thật/i })).toHaveCount(0);
  await expect(lab).not.toContainText(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/);
});
