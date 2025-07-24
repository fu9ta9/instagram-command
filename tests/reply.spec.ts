import { test, expect } from '@playwright/test';

test.describe('Reply Page - 有料会員(PAID)', () => {
  test.beforeEach(async ({ page }) => {
    // 有料ユーザーのモックデータを設定 - より具体的なパターンに変更
    await page.route('**/api/membership/**', async route => {
      console.log('Membership API intercepted:', route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          membershipType: 'PAID',
          trialStartDate: null,
          stripeSubscriptionId: 'sub_test123',
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      });
    });

    // 返信データのモック
    await page.route('/api/replies*', async route => {
      await route.fulfill({ json: [] });
    });
  });

  test('DM自動返信設定ページが正常に表示される', async ({ page }) => {
    await page.goto('/reply');
    
    // ページタイトルが表示されることを確認
    await expect(page.getByRole('heading', { name: 'DM自動返信設定' })).toBeVisible();
    
    // メインコンテナが表示されることを確認
    await expect(page.locator('.container')).toBeVisible();
  });

  test('有料会員の場合、新規返信登録ボタンが表示される', async ({ page }) => {
    await page.goto('/reply');
    
    // 有料会員は新規登録ボタンが表示される（正規表現で動的テキストに対応）
    const newReplyButton = page.getByRole('button', { name: /新規登録（.*用）/ });
    await expect(newReplyButton).toBeVisible();
    
    // アップグレードボタンは表示されない
    const upgradeButton = page.getByRole('button', { name: '会員をアップグレード' });
    await expect(upgradeButton).not.toBeVisible();
  });

  test('ページがローディング状態から正常に遷移する', async ({ page }) => {
    await page.goto('/reply');
    
    // ローディングスピナーが表示される可能性があるが、最終的にはコンテンツが表示される
    await page.waitForLoadState('networkidle');
    
    // メインコンテンツが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test('有料会員は自動返信機能を利用できる', async ({ page }) => {
    await page.goto('/reply');
    
    // 新規登録ボタンがクリック可能であることを確認（正規表現使用）
    const newReplyButton = page.getByRole('button', { name: /新規登録（.*用）/ });
    await expect(newReplyButton).toBeEnabled();
    
    // 制限メッセージが表示されていないことを確認
    const restrictionMessage = page.locator('text=自動返信は有料会員の機能です');
    await expect(restrictionMessage).not.toBeVisible();
  });

  test('ストーリータブでボタンテキストが変更される', async ({ page }) => {
    await page.goto('/reply');
    
    // デフォルトでフィード/リール用ボタンが表示されることを確認
    const postReplyButton = page.getByRole('button', { name: '新規登録（フィード/リール用）' });
    await expect(postReplyButton).toBeVisible();
    
    // ストーリータブをクリック
    const storyTab = page.getByRole('button', { name: 'ストーリー' });
    await storyTab.click();
    
    // ストーリー用のボタンが表示されることを確認
    const storyReplyButton = page.getByRole('button', { name: '新規登録（ストーリー用）' });
    await expect(storyReplyButton).toBeVisible();
    await expect(storyReplyButton).toBeEnabled();
    
    // フィード/リール用ボタンが非表示になることを確認
    await expect(postReplyButton).not.toBeVisible();
  });

  test('タブ切り替えが正常に動作する', async ({ page }) => {
    await page.goto('/reply');
    
    // デフォルトでフィード/リールタブが選択されている（タブナビゲーション内の特定ボタン）
    const postTab = page.locator('nav[aria-label="Tabs"] button').filter({ hasText: 'フィード/リール' });
    await expect(postTab).toHaveClass(/border-blue-500/);
    
    // ストーリータブをクリック
    const storyTab = page.locator('nav[aria-label="Tabs"] button').filter({ hasText: 'ストーリー' });
    await storyTab.click();
    
    // ストーリータブが選択状態になる
    await expect(storyTab).toHaveClass(/border-blue-500/);
    
    // フィード/リールタブが非選択状態になる
    await expect(postTab).toHaveClass(/border-transparent/);
  });
});

// 無料会員(FREE)のテストケース
test.describe('Reply Page - 無料会員(FREE)', () => {
  test.beforeEach(async ({ page }) => {
    // 無料ユーザーのモックデータを設定
    await page.route('/api/membership/*', async route => {
      await route.fulfill({
        json: {
          membershipType: 'FREE',
          trialStartDate: null,
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
          status: null
        }
      });
    });

    // 返信データのモック（空の配列）
    await page.route('/api/replies*', async route => {
      await route.fulfill({ json: [] });
    });
  });

  test('無料会員の場合、アップグレードボタンが表示される', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // 無料会員は「会員をアップグレード」ボタンが表示される
    const upgradeButton = page.getByRole('button', { name: '会員をアップグレード' });
    await expect(upgradeButton).toBeVisible();
    
    // 新規登録ボタンは表示されない
    const newReplyButton = page.locator('button:has-text("新規登録")');
    await expect(newReplyButton).not.toBeVisible();
  });

  test('無料会員には制限メッセージが表示される', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // 制限メッセージが表示されることを確認
    const restrictionMessage = page.locator('text=自動返信は有料会員の機能です');
    await expect(restrictionMessage).toBeVisible();
  });

  test('無料会員のアップグレードボタンクリックでプランページに遷移', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // アップグレードボタンをクリック
    const upgradeButton = page.getByRole('button', { name: '会員をアップグレード' });
    await upgradeButton.click();
    
    // プランページに遷移することを確認
    await expect(page).toHaveURL('/plan');
  });

  test('無料会員には返信データがある場合警告メッセージが表示される', async ({ page }) => {
    // 返信データのモック（サンプルデータ）
    await page.route('/api/replies*', async route => {
      await route.fulfill({
        json: [{
          id: '1',
          keyword: 'テスト',
          replyText: 'テスト返信',
          matchType: 1,
          replyType: 1
        }]
      });
    });

    await page.goto('/reply');
    await page.waitForLoadState('networkidle');

    // 無料会員用の警告メッセージが表示される
    const warningMessage = page.locator('text=登録済みの返信文は自動返信されません');
    await expect(warningMessage).toBeVisible();
    
    // アップグレードボタンも表示される
    const upgradeButton = page.getByRole('button', { name: '会員をアップグレード' });
    await expect(upgradeButton).toBeVisible();
  });
});

// トライアル会員(TRIAL)のテストケース
test.describe('Reply Page - トライアル会員(TRIAL)', () => {
  test.beforeEach(async ({ page }) => {
    // トライアルユーザーのモックデータを設定
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() - 3); // 3日前に開始

    await page.route('/api/membership/*', async route => {
      await route.fulfill({
        json: {
          membershipType: 'TRIAL',
          trialStartDate: trialStartDate.toISOString(),
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
          status: null
        }
      });
    });

    // 返信データのモック
    await page.route('/api/replies*', async route => {
      await route.fulfill({ json: [] });
    });
  });

  test('トライアル会員の場合、新規登録ボタンが表示される', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // トライアル会員は有料会員と同様の機能を利用可能
    const newReplyButton = page.locator('button:has-text("新規登録")');
    await expect(newReplyButton).toBeVisible();
    
    // アップグレードボタンは表示されない（トライアル期間中）
    const upgradeButton = page.getByRole('button', { name: '会員をアップグレード' });
    await expect(upgradeButton).not.toBeVisible();
  });

  test('トライアル会員は自動返信機能を利用できる', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // 新規登録ボタンがクリック可能であることを確認
    const newReplyButton = page.locator('button:has-text("新規登録")');
    await expect(newReplyButton).toBeEnabled();
    
    // 制限メッセージが表示されていないことを確認
    const restrictionMessage = page.locator('text=自動返信は有料会員の機能です');
    await expect(restrictionMessage).not.toBeVisible();
  });

  test('トライアル会員のタブ切り替えが正常に動作する', async ({ page }) => {
    await page.goto('/reply');
    await page.waitForLoadState('networkidle');
    
    // ストーリータブをクリック
    const storyTab = page.locator('nav[aria-label="Tabs"] button').filter({ hasText: 'ストーリー' });
    await storyTab.click();
    
    // ストーリー用の登録ボタンが表示される
    const storyReplyButton = page.locator('button:has-text("新規登録（ストーリー用）")');
    await expect(storyReplyButton).toBeVisible();
  });
}); 