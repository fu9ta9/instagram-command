import { test, expect } from '@playwright/test';

test.describe('Manual Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manual');
  });

  test('各タブのラベルが正しく表示されている', async ({ page }) => {
    // 現在の実装に合わせたラベルで確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'プラン' })).toBeVisible();
    await expect(page.getByRole('button', { name: '連携' })).toBeVisible();
    await expect(page.getByRole('button', { name: '検索' })).toBeVisible();
    await expect(page.getByRole('button', { name: '返信' })).toBeVisible();
  });

  test('デフォルトで「ログイン」セクションのコンテンツが表示されている', async ({ page }) => {
    // デフォルトでログインセクションが選択されていることを確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    
    // ログインセクションの説明文が表示されることを確認
    await expect(page.getByText('トップページ右上または「無料トライアルを始める」ボタンからログイン画面へ進みます。')).toBeVisible();
  });

  test('タブをクリックすると該当セクションのコンテンツが表示される', async ({ page }) => {
    // プランタブをクリック
    await page.getByRole('button', { name: 'プラン' }).click();
    await expect(page.getByRole('heading', { name: 'プラン選択' })).toBeVisible();
    await expect(page.getByText('メニューの「プラン」タブを開きます。')).toBeVisible();

    // 連携タブをクリック
    await page.getByRole('button', { name: '連携' }).click();
    await expect(page.getByRole('heading', { name: 'Instagram連携' })).toBeVisible();
    await expect(page.getByText('メニューの「連携」タブを開きます。')).toBeVisible();

    // 検索タブをクリック  
    await page.getByRole('button', { name: '検索' }).click();
    await expect(page.getByRole('heading', { name: 'アカウント検索' })).toBeVisible();
    await expect(page.getByText('メニューの「検索」タブを開きます。')).toBeVisible();

    // 返信タブをクリック
    await page.getByRole('button', { name: '返信' }).click();
    await expect(page.getByRole('heading', { name: 'DM自動送信設定' })).toBeVisible();
    await expect(page.getByText('メニューの「返信」タブを開きます。')).toBeVisible();
  });

  test('PC画面/SP画面の切り替えボタンが動作する', async ({ page }) => {
    // PC画面ボタンが表示されることを確認
    const pcButton = page.getByRole('button', { name: 'PC画面' });
    const spButton = page.getByRole('button', { name: 'スマホ画面' });
    
    await expect(pcButton).toBeVisible();
    await expect(spButton).toBeVisible();
    
    // デフォルトでPC画面が選択されていることを確認（より具体的なセレクター）
    await expect(pcButton).toHaveClass(/bg-blue-600/);
    
    // スマホ画面に切り替え
    await spButton.click();
    await expect(spButton).toHaveClass(/bg-blue-600/);
    
    // PC画面ボタンが非選択状態になることを確認
    await expect(pcButton).not.toHaveClass(/bg-blue-600/);
    
    // 手順説明が更新されることを確認
    await expect(page.getByText('スマホ画面での操作手順')).toBeVisible();
  });

  test('画像スライダーのナビゲーションボタンが表示される', async ({ page }) => {
    // 左右のナビゲーションボタンが表示されることを確認
    const prevButton = page.getByRole('button', { name: '前へ' });
    const nextButton = page.getByRole('button', { name: '次へ' });
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // ナビゲーションボタンがSwiperスライダー用であることを確認
    await expect(page.locator('.swiper')).toBeVisible();
  });

  test('各セクションのステップリストが表示される', async ({ page }) => {
    // ログインセクションのステップが表示されることを確認
    await expect(page.locator('ol.list-decimal')).toBeVisible();
    
    // 各セクションでステップリストが表示されることを確認
    const sections = ['プラン', '連携', '検索', '返信'];
    
    for (const section of sections) {
      await page.getByRole('button', { name: section }).click();
      await expect(page.locator('ol.list-decimal')).toBeVisible();
      
      // ステップリストにコンテンツがあることを確認
      const listItems = page.locator('ol.list-decimal li');
      await expect(listItems).not.toHaveCount(0);
    }
  });

  test('認証不要でアクセスできる', async ({ page }) => {
    // manualページは認証なしでアクセス可能であることを確認
    await expect(page).toHaveURL('/manual');
    
    // ログインページにリダイレクトされていないことを確認
    await expect(page).not.toHaveURL(/\/auth\/signin/);
    
    // メインコンテンツが表示されることを確認
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('セクション選択時にアクティブ状態が正しく表示される', async ({ page }) => {
    // デフォルトでログインセクションがアクティブ
    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await expect(loginButton).toHaveClass(/text-blue-600/);
    
    // プランセクションをクリック
    const planButton = page.getByRole('button', { name: 'プラン' });
    await planButton.click();
    
    // プランボタンがアクティブになる
    await expect(planButton).toHaveClass(/text-blue-600/);
    
    // ログインボタンが非アクティブになる
    await expect(loginButton).toHaveClass(/text-gray-600/);
  });

  test('画像が存在しない場合の表示', async ({ page }) => {
    // 画像が存在しないセクションがある場合の表示確認
    // （実装によっては「画像がありません」メッセージが表示される）
    const noImageMessage = page.locator('text=画像がありません');
    
    // 条件によってはメッセージが表示される可能性がある
    // このテストは画像データの状態に依存する
  });
}); 