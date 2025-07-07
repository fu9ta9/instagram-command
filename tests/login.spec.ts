import { test, expect } from '@playwright/test';

test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Googleでログインボタンが表示されている', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Googleでログイン/ })).toBeVisible();
  });

  test('ロゴ・サービス名・キャッチコピーが表示されている', async ({ page }) => {
    await expect(page.getByText('InstaCommand')).toBeVisible();
    await expect(page.getByText('Instagram運用をもっとスマートに')).toBeVisible();
  });
}); 