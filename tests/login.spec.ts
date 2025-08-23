import { test, expect } from '@playwright/test';

test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('Googleでログインボタンが表示されている', async ({ page }) => {
    // ボタンのテキストで確認
    await expect(page.locator('button:has-text("Googleでログイン")')).toBeVisible();
    
    // またはspanの中のテキストで確認
    await expect(page.locator('span:has-text("Googleでログイン")')).toBeVisible();
  });

  test('ロゴ・サービス名・キャッチコピーが表示されている', async ({ page }) => {
    await expect(page.getByText('InstaCommand')).toBeVisible();
    await expect(page.getByText('Instagram運用をもっとスマートに')).toBeVisible();
  });

  test('ログインページの主要コンポーネントが表示される', async ({ page }) => {
    // ロゴ画像が表示される
    const logoImage = page.locator('img[alt="InstaCommand Logo"]');
    await expect(logoImage).toBeVisible();
    
    // サービス名がh1タグで表示される
    await expect(page.locator('h1:has-text("InstaCommand")')).toBeVisible();
    
    // キャッチコピーが表示される
    await expect(page.locator('p:has-text("Instagram運用をもっとスマートに")')).toBeVisible();
  });

  test('認証不要でアクセスできる', async ({ page }) => {
    // loginページは認証なしでアクセス可能であることを確認
    await expect(page).toHaveURL('/login');
    
    // ページが正常に表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('認証済み状態でconnectページが正常に表示される', async ({ page }) => {
    // 認証済み状態でconnectページに直接アクセス
    await page.goto('/connect');
    await page.waitForLoadState('networkidle');
    
    // connectページへの到達確認
    await expect(page).toHaveURL(/.*\/connect/);
    
    // ページの基本要素確認
    await expect(page.locator('body')).toBeVisible();
    
    // connectページの主要コンテンツを確認
    const connectPageElements = [
      { selector: page.getByText('Instagram'), name: 'Instagramテキスト' },
      { selector: page.getByText('連携'), name: '連携テキスト' },
      { selector: page.getByText('Facebook'), name: 'Facebookテキスト' },
      { selector: page.locator('button'), name: '何らかのボタン' },
      { selector: page.locator('h1, h2, h3'), name: 'ヘッダー要素' }
    ];
    
    let foundElements = [];
    
    for (const element of connectPageElements) {
      try {
        const isVisible = await element.selector.first().isVisible({ timeout: 3000 });
        if (isVisible) {
          foundElements.push(element.name);
        }
      } catch {
        // 要素が見つからない場合は無視
      }
    }
    
    // 最低でも1つの要素が見つかることを確認
    expect(foundElements.length).toBeGreaterThan(0);
  });
}); 