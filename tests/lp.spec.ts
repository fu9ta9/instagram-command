import { test, expect } from '@playwright/test';

// LP（ランディングページ）のE2Eテスト
// baseURLはplaywright.config.tsで設定するか、明示的にhttp://localhost:3000などを指定してください

test.describe('ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('キャッチコピー・説明文が表示されている', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Instagram自動返信/ })).toBeVisible();
    await expect(page.getByText(/お手軽価格で/)).toBeVisible();
    await expect(page.getByText(/高すぎる.*月額3,980円/)).toBeVisible();
    await expect(page.getByText(/誰でも手軽に.*スマートフォンからも/)).toBeVisible();
  });

  test('無料トライアルボタンが存在しクリックできる', async ({ page }) => {
    const trialBtn = page.getByRole('button', { name: /無料トライアルを始める/ });
    await expect(trialBtn).toBeVisible();
    // クリック自体は認証が絡むため、ここでは押せることのみ検証
    await trialBtn.click();
  });

  test('hero画像が表示されている', async ({ page }) => {
    const heroImg = page.locator('img[alt="アプリのイメージ"]');
    await expect(heroImg).toBeVisible();
  });

  test('ナビゲーションのリンクが存在する', async ({ page }) => {
    await expect(page.getByRole('link', { name: '機能紹介' })).toBeVisible();
    await expect(page.getByRole('link', { name: '使い方' })).toBeVisible();
    await expect(page.getByRole('link', { name: '料金プラン' })).toBeVisible();
  });
}); 