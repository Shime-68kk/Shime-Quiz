import { expect, test } from '@playwright/test';

const CRITICAL_CONSOLE_TYPES = new Set(['error']);
const HARMLESS_CONSOLE_PATTERNS = [/favicon/i];

function installCriticalErrorCapture(page) {
  const criticalErrors = [];

  page.on('console', message => {
    if (!CRITICAL_CONSOLE_TYPES.has(message.type())) return;
    const text = message.text();
    if (HARMLESS_CONSOLE_PATTERNS.some(pattern => pattern.test(text))) return;
    criticalErrors.push(`console.${message.type()}: ${text}`);
  });

  page.on('pageerror', error => {
    criticalErrors.push(`pageerror: ${error.message}`);
  });

  return criticalErrors;
}

async function resetBrowserStorage(page) {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function expectNoCriticalErrors(criticalErrors) {
  expect(criticalErrors, criticalErrors.join('\n')).toEqual([]);
}

async function expectNoUnsupportedAiOrCloudUi(page) {
  // Allowed guardrail copy may mention unsupported features in negative form.
  // These assertions target actual controls that would enable unsupported AI/BYOK/OCR/cloud behavior.
  await expect(page.getByRole('textbox', { name: /API key|BYOK/i })).toHaveCount(0);
  await expect(page.getByLabel(/API key|BYOK/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /connect.*AI|generate.*with.*AI|enable.*OCR|scan.*OCR|sync.*cloud|enable.*cloud/i })).toHaveCount(0);
  await expect(page.getByRole('form', { name: /API key|BYOK|OCR|cloud sync/i })).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await resetBrowserStorage(page);
});

test('Dashboard first-run onboarding points to safe Library start options', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Chào mừng quay lại' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chưa có dữ liệu học tập' })).toBeVisible();

  const onboarding = page.locator('.dashboardFirstRunOnboardingCard');
  await expect(onboarding).toBeVisible();
  await expect(onboarding).toContainText(/Thư viện/);
  await expect(onboarding).toContainText(/quiz mẫu|Dùng quiz mẫu/i);
  await expect(onboarding).toContainText(/JSON\/CSV/);
  await expect(onboarding).toContainText(/text\/Markdown/);
  await expect(onboarding).toContainText(/copy\/paste|thủ công/i);
  await expect(onboarding).toContainText(/Shime không gọi AI\/API/);
  await expect(onboarding).toContainText(/EduGen chạy riêng|được cấu hình/i);

  await page.getByRole('button', { name: 'Mở Thư viện' }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();
  await expectNoUnsupportedAiOrCloudUi(page);
  await expectNoCriticalErrors(criticalErrors);
});

test('Library onboarding surfaces import choices without hiding existing controls', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  await page.goto('/library');
  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();

  const pageBody = page.locator('body');
  const emptyState = page.getByRole('heading', { name: 'Thư viện của bạn đang trống' });
  if (await emptyState.count()) {
    await expect(emptyState).toBeVisible();
    await expect(pageBody).toContainText(/Thư viện của bạn đang trống/);
  }

  await expect(pageBody).toContainText(/Dùng quiz mẫu/);
  await expect(pageBody).toContainText(/JSON\/CSV|Nạp JSON\/CSV/);
  await expect(pageBody).toContainText(/text\/Markdown|văn bản\/Markdown/i);
  await expect(pageBody).toContainText(/copy\/paste|thủ công/i);
  await expect(pageBody).toContainText(/EduGen.*riêng|EduGen File Processor|được cấu hình/i);
  await expect(page.getByRole('button', { name: 'Nạp JSON/CSV' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dùng quiz mẫu' })).toBeVisible();
  await expect(page.getByLabel('Chọn file JSON hoặc CSV học liệu')).toBeAttached();
  await expectNoUnsupportedAiOrCloudUi(page);
  await expectNoCriticalErrors(criticalErrors);
});

test('Demo sample quickstart opens preview and does not auto-save before confirmation', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  await page.goto('/library');
  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dùng quiz mẫu' })).toBeVisible();

  await page.getByRole('button', { name: 'Dùng quiz mẫu' }).click();

  const preview = page.locator('.importPreview');
  await expect(preview).toBeVisible();
  await expect(preview.getByRole('heading', { name: 'Xem trước file nạp' })).toBeVisible();
  await expect(preview).toContainText(/Bộ quiz mẫu cục bộ|Đã tải bộ quiz mẫu/);
  await expect(preview).toContainText(/Đánh giá chất lượng bản nháp/);
  await expect(preview).toContainText(/Mục học mẫu/);
  await expect(preview.getByRole('button', { name: 'Import và lưu cục bộ' })).toBeVisible();

  await expect(page.getByText('Đã import và lưu cục bộ')).toHaveCount(0);
  const storageKeysBeforeSave = await page.evaluate(() => Object.keys(window.localStorage));
  expect(storageKeysBeforeSave.some(key => /library/i.test(key))).toBe(false);

  await expectNoUnsupportedAiOrCloudUi(page);
  await expect(page.getByText(/EduGen.*required|phải chạy EduGen để dùng quiz mẫu/i)).toHaveCount(0);
  await expectNoCriticalErrors(criticalErrors);
});
