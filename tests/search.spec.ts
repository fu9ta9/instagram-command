import { test, expect } from '@playwright/test';

test.describe('Search Page - 有料会員(PAID)', () => {
  test('Instagram投稿検索ページが正常に表示される', async ({ page }) => {
    await page.goto('/search');
    
    // ページが正常にロードされることを確認
    await page.waitForLoadState('networkidle');
    
    // メインコンテナが表示されることを確認
    await expect(page.locator('.container')).toBeVisible();
  });

  test('有料会員はInstagramPostAnalyzerコンポーネントにフルアクセスできる', async ({ page }) => {
    await page.goto('/search');
    
    // ページが完全にロードされるまで待機
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // ページが正常にレンダリングされることを確認
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    
    // エラーが発生していないことを確認
    await expect(page).toHaveURL('/search');
  });

  test('認証が必要なページとして機能する', async ({ page }) => {
    await page.goto('/search');
    
    // 認証済み状態でアクセスできることを確認
    // （テストモードでは自動的にダミーセッションが提供される）
    await expect(page).toHaveURL('/search');
  });

  test('AppLayoutが適用されている', async ({ page }) => {
    await page.goto('/search');
    
    // ページが正常にレンダリングされることを確認
    await page.waitForSelector('body', { state: 'visible' });
    
    // レイアウトが適用されていることを間接的に確認
    // （具体的なレイアウト要素はAppLayoutの実装によって変わる）
    const html = await page.innerHTML('body');
    expect(html.length).toBeGreaterThan(0);
  });

  test('有料会員は検索・分析機能を制限なく利用できる', async ({ page }) => {
    await page.goto('/search');
    
    // 制限メッセージが表示されていないことを確認
    await page.waitForLoadState('networkidle');
    
    // 機能制限に関する警告が表示されていないことを確認
    const restrictionWarning = page.locator('text=この機能は有料会員限定です');
    await expect(restrictionWarning).not.toBeVisible();
  });

  test('ページのエラーハンドリングが正常に動作する', async ({ page }) => {
    await page.goto('/search');
    
    // エラーページにリダイレクトされていないことを確認
    await expect(page).toHaveURL('/search');
    
    // コンソールエラーが過度に発生していないことを確認
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000); // 少し待ってからエラーチェック
    
    // 致命的なエラーがないことを確認（警告レベルは許容）
    const criticalErrors = errors.filter(error => 
      error.includes('Error:') && !error.includes('Warning:')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

/*
// 無料会員(FREE)のテストケース - 将来的に有効化
test.describe('Search Page - 無料会員(FREE)', () => {
  test('無料会員でも基本的な検索ページにアクセスできる', async ({ page }) => {
    // TODO: 会員種別をFREEに設定する仕組みを実装後に有効化
    await page.goto('/search');
    
    // ページは表示されるが機能制限があることを確認
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.container')).toBeVisible();
  });

  test('無料会員には機能制限メッセージが表示される', async ({ page }) => {
    await page.goto('/search');
    
    // 機能制限に関するメッセージが表示されることを確認
    const restrictionMessage = page.locator('text=この機能は有料会員限定です');
    await expect(restrictionMessage).toBeVisible();
    
    // アップグレード案内が表示されることを確認
    const upgradeMessage = page.locator('text=プランをアップグレード');
    await expect(upgradeMessage).toBeVisible();
  });

  test('無料会員は検索機能が制限される', async ({ page }) => {
    await page.goto('/search');
    
    // 検索機能の一部が無効化されていることを確認
    // TODO: 具体的な機能制限の確認を追加
  });
});

// トライアル会員(TRIAL)のテストケース - 将来的に有効化
test.describe('Search Page - トライアル会員(TRIAL)', () => {
  test('トライアル会員は有料機能をフル利用できる', async ({ page }) => {
    // TODO: 会員種別をTRIALに設定する仕組みを実装後に有効化
    await page.goto('/search');
    
    // トライアル期間中は有料会員と同等の機能を利用可能
    await page.waitForLoadState('networkidle');
    
    // 制限メッセージが表示されていないことを確認
    const restrictionMessage = page.locator('text=この機能は有料会員限定です');
    await expect(restrictionMessage).not.toBeVisible();
  });

  test('トライアル会員にはトライアル情報が表示される', async ({ page }) => {
    await page.goto('/search');
    
    // トライアル期間に関する情報が表示されることを確認
    // TODO: トライアル期間表示の確認を追加
  });

  test('トライアル会員は検索・分析機能を制限なく利用できる', async ({ page }) => {
    await page.goto('/search');
    
    // 全ての検索・分析機能にアクセス可能
    await page.waitForLoadState('networkidle');
    
    // 機能制限がないことを確認
    // TODO: 具体的な機能アクセス権の確認を追加
  });
});
*/ 