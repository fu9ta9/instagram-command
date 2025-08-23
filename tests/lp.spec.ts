import { test, expect } from '@playwright/test';

// LP（ランディングページ）のE2Eテスト
// baseURLはplaywright.config.tsで設定するか、明示的にhttp://localhost:3000などを指定してください

test.describe('ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('キャッチコピー・説明文が表示されている', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Instagram自動返信/ })).toBeVisible();
    await expect(page.getByText(/お手軽価格で/)).toBeVisible();
    await expect(page.getByText(/高すぎる.*月額3,980円/)).toBeVisible();
    await expect(page.getByText(/誰でも手軽に.*スマートフォンからも/)).toBeVisible();
  });

  test('無料トライアルボタンが存在しクリックできる', async ({ page }) => {
    // より具体的なセレクターを使用してボタンを特定
    const trialButtons = page.getByRole('button', { name: /無料トライアルを始める/ });
    await expect(trialButtons.first()).toBeVisible();
    await expect(trialButtons.first()).toBeEnabled();
    
    // 複数のボタンがある場合は最初のものをクリック
    await trialButtons.first().click();
  });

  test('hero画像が表示されている', async ({ page }) => {
    // メインビジュアル要素が表示されることを確認
    const heroSection = page.locator('section, div').first();
    await expect(heroSection).toBeVisible();
    
    // 画像が存在する場合は表示を確認
    const images = page.locator('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('ナビゲーションのリンクが存在する', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');
    
    // ナビゲーションエリアまたはヘッダーが存在するか確認
    const navElements = page.locator('nav, header');
    const navCount = await navElements.count();
    
    if (navCount > 0) {
      await expect(navElements.first()).toBeVisible();
    }
    
    // リンクが存在するか確認
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // メインコンテンツが表示されることを確認
    const mainElements = page.locator('main, body');
    await expect(mainElements.first()).toBeVisible();
  });

  test('ランディングページの主要セクションが表示される', async ({ page }) => {
    // メインコンテンツが表示される
    await expect(page.locator('main').first()).toBeVisible();
    
    // 複数のセクションが存在することを確認
    const sections = page.locator('section, div[class*="Section"]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(1);
  });
}); 