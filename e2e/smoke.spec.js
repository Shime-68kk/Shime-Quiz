import { expect, test } from '@playwright/test';

const CRITICAL_CONSOLE_TYPES = new Set(['error']);
const HARMLESS_CONSOLE_PATTERNS = [
  /favicon/i
];

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

async function expectNoDocumentHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth + 2);
  expect(overflow.bodyScrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

test.beforeEach(async ({ page }) => {
  await resetBrowserStorage(page);
});

test('routes render without critical uncaught errors', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  for (const route of ['/', '/dashboard', '/library', '/study-room']) {
    await page.goto(route);
    await expect(page.locator('#root')).toBeVisible();
  }

  await expect(page.getByRole('heading', { name: /Chào mừng quay lại|Thư viện học liệu|Phòng học tập trung/ })).toBeVisible();
  await expectNoCriticalErrors(criticalErrors);
});

test('dashboard Hoc tiep CTA opens Study Room', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Chào mừng quay lại' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Học tiếp' })).toBeVisible();
  await page.getByRole('button', { name: 'Học tiếp' }).click();
  await expect(page).toHaveURL(/\/study-room$/);
  await expect(page.getByRole('heading', { name: 'Phòng học tập trung' })).toBeVisible();

  await expectNoCriticalErrors(criticalErrors);
});

test('mobile viewport renders primary routes without document overflow', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Chào mừng quay lại' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);

  await page.getByRole('link', { name: /Thư viện/ }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);

  await page.getByRole('link', { name: /Học/ }).click();
  await expect(page).toHaveURL(/\/study-room$/);
  await expect(page.getByRole('heading', { name: 'Phòng học tập trung' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hoàn thành phiên học' })).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page);

  await expectNoCriticalErrors(criticalErrors);
});

test('import UI accepts valid JSON and blocks invalid import fixtures with Vietnamese feedback', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);
  await page.goto('/library');
  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();
  await page.getByRole('tab', { name: 'Xưởng nạp tài liệu' }).click();

  const importInput = page.getByLabel('Chọn file JSON hoặc CSV học liệu');

  await importInput.setInputFiles('tests/fixtures/valid-import.json');
  await expect(page.getByRole('heading', { name: 'Xem trước file nạp' })).toBeVisible();
  await expect(page.getByText('Sẵn sàng import')).toBeVisible();
  await page.getByRole('button', { name: 'Import và lưu cục bộ' }).click();
  await expect(page.getByText('Đã import và lưu cục bộ')).toBeVisible();
  await page.getByRole('tab', { name: 'Kệ sách của tôi' }).click();
  await expect(page.getByText('Môn kiểm thử E2E')).toBeVisible();
  await page.getByRole('tab', { name: 'Xưởng nạp tài liệu' }).click();

  await importInput.setInputFiles('tests/fixtures/invalid-import.json');
  await expect(page.getByText('Không thể import file này')).toBeVisible();
  const invalidImportPreview = page.locator('.importPreview');
  await expect(invalidImportPreview.getByText('Lỗi cần sửa')).toBeVisible();
  await expect(invalidImportPreview.getByText(/Không có mục học hợp lệ|Chưa có mục học hợp lệ|File có lỗi cấu trúc/).first()).toBeVisible();
  await invalidImportPreview.getByRole('button', { name: 'Hủy xem trước' }).click();

  await importInput.setInputFiles('tests/fixtures/invalid-choice-answer.json');
  await expect(page.getByText('Không thể import file này')).toBeVisible();
  const invalidChoicePreview = page.locator('.importPreview');
  await expect(invalidChoicePreview.getByText('Lỗi cần sửa')).toBeVisible();
  await expect(invalidChoicePreview.getByText(/Đáp án đúng|correctAnswer|lựa chọn/i).first()).toBeVisible();
  await invalidChoicePreview.getByRole('button', { name: 'Hủy xem trước' }).click();

  await importInput.setInputFiles('tests/fixtures/malformed-import.json');
  await expect(page.getByText('Không thể import file này')).toBeVisible();
  const malformedPreview = page.locator('.importPreview');
  await expect(malformedPreview.getByText('Lỗi cần sửa')).toBeVisible();
  await expect(malformedPreview.getByText(/Không đọc được JSON/).first()).toBeVisible();

  await expectNoCriticalErrors(criticalErrors);
});

test('Study Room default flow can answer items, finish, and persist local history', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);
  page.on('dialog', dialog => dialog.accept());

  await page.goto('/study-room');
  await expect(page.getByRole('heading', { name: 'Phòng học tập trung' })).toBeVisible();

  const applicationChoice = page.locator('.choiceOption').filter({ hasText: 'Application' }).first();
  await applicationChoice.click();
  await expect(page.getByLabel(/Application/)).toBeChecked();
  await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();
  await expect(page.getByText('Đúng', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  await expect(page.getByRole('button', { name: 'Lật thẻ' })).toBeVisible();
  await page.getByRole('button', { name: 'Lật thẻ' }).click();
  await expect(page.getByText(/Truyền dữ liệu đầu cuối/)).toBeVisible();

  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  const privateRangeChoice = page.locator('.choiceOption').filter({ hasText: /10\.0\.0\.0\/8/ }).first();
  await privateRangeChoice.click();
  await expect(page.getByLabel(/10\.0\.0\.0\/8/)).toBeChecked();
  await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();

  await page.getByRole('button', { name: 'Câu tiếp theo' }).click();
  await page.getByRole('textbox').fill('/24');
  await page.getByRole('button', { name: 'Kiểm tra đáp án' }).click();

  await page.getByRole('button', { name: 'Hoàn thành phiên học' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tổng kết phiên học' })).toBeVisible();
  const resultSummary = page.locator('.studyResultHero');
  await expect(resultSummary).toBeVisible();
  await expect(resultSummary.getByRole('heading', { level: 2, name: 'Tổng kết phiên học' })).toBeVisible();
  await expect(resultSummary.getByText('Kết quả học tập đã được lưu cục bộ')).toBeVisible();
  await expect(resultSummary.locator('.studyHistorySaveMessage')).toContainText(/lịch sử học|lịch ôn tập/i);

  const storageState = await page.evaluate(() => ({
    keys: Object.keys(window.localStorage),
    values: Object.fromEntries(Object.keys(window.localStorage).map(key => [key, window.localStorage.getItem(key)]))
  }));
  expect(storageState.keys.some(key => /history|review|study/i.test(key))).toBe(true);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Phòng học tập trung' })).toBeVisible();
  const reloadedKeys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(reloadedKeys.some(key => /history|review|study/i.test(key))).toBe(true);

  await expectNoCriticalErrors(criticalErrors);
});

test('backup controls are usable and full backup download can be triggered', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);
  await page.goto('/library');

  await expect(page.getByRole('heading', { name: 'Thư viện học liệu' })).toBeVisible();
  await page.getByRole('tab', { name: 'Xưởng nạp tài liệu' }).click();
  await expect(page.getByRole('heading', { name: 'Sao lưu dữ liệu' })).toBeVisible();
  const backupModeChooser = page.locator('.backupModeChooser');
  await expect(backupModeChooser.getByText('Sao lưu đầy đủ')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sao lưu dữ liệu' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(page.getByText('Đã tạo file sao lưu')).toBeVisible();
  await expect(page.getByLabel('Chọn file sao lưu')).toBeAttached();

  await expectNoCriticalErrors(criticalErrors);
});

test('keyboard focus reaches primary controls on key routes', async ({ page }) => {
  const criticalErrors = installCriticalErrorCapture(page);

  for (const route of ['/dashboard', '/library', '/study-room']) {
    await page.goto(route);
    const focusableCount = await page.locator('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])').count();
    expect(focusableCount).toBeGreaterThan(0);
    await page.keyboard.press('Tab');
    const activeTag = await page.evaluate(() => document.activeElement?.tagName || '');
    expect(activeTag).not.toBe('BODY');
  }

  await expectNoCriticalErrors(criticalErrors);
});
