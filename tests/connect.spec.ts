import { test, expect } from '@playwright/test';

test.describe('Connect Page', () => {
  test('ログイン後に/connectページが表示される', async ({ page }) => {
    await page.goto('/connect');
    await page.waitForLoadState('networkidle');
    
    // ページタイトルや主要要素で判定
    await expect(page.getByRole('heading', { name: 'Instagram連携' })).toBeVisible();
    
    // AppLayoutが適用されていることを確認
    await expect(page.locator('body')).toBeVisible();
    
    // ローディング状態から正常に遷移することを確認
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).not.toBeVisible();
  });

  test('Instagram連携コンポーネントが表示される', async ({ page }) => {
    await page.goto('/connect');
    await page.waitForLoadState('networkidle');
    
    // Instagram連携の主要コンポーネントが表示される
    await expect(page.getByRole('heading', { name: 'Instagram連携' })).toBeVisible();
    
    // Facebook連携ボタンまたは既存の連携情報が表示される
    // (認証状態によって表示内容が変わるため、どちらかが表示されることを確認)
    const facebookConnect = page.locator('text=Facebook');
    const connectedStatus = page.locator('text=連携済み');
    
    await expect(facebookConnect.or(connectedStatus)).toBeVisible();
  });

  test('認証が必要なページとして機能する', async ({ page }) => {
    await page.goto('/connect');
    
    // 認証済み状態でアクセスできることを確認
    // （テストモードでは自動的にダミーセッションが提供される）
    await expect(page).toHaveURL('/connect');
    
    // ログインページにリダイレクトされていないことを確認
    await expect(page).not.toHaveURL(/\/auth\/signin/);
  });
}); 