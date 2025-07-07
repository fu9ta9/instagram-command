import { test, expect } from '@playwright/test';

test('ログイン後に/connectページが表示される', async ({ page }) => {
  await page.goto('/connect');
  // ページタイトルや主要要素で判定
  await expect(page.getByRole('heading', { name: 'Instagram連携' })).toBeVisible();
}); 