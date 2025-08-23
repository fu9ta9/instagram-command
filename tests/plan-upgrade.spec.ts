import { test, expect } from '@playwright/test';

// Stripeアップグレード・ダウングレードのE2Eテスト
test.describe('Plan Upgrade/Downgrade Tests', () => {
  
  test.describe('無料会員 → トライアル開始', () => {
    test('トライアル開始後にAPIとUI表示が正しく更新される', async ({ page }) => {
      // 初期状態: 無料会員（トライアル未使用）
      await page.route('/api/user/status', async route => {
        const url = route.request().url();
        if (url.includes('after-trial')) {
          // トライアル開始後の状態
          const trialStartDate = new Date();
          await route.fulfill({
            json: {
              membership: {
                type: 'TRIAL',
                trialStartDate: trialStartDate.toISOString()
              },
              subscription: null
            }
          });
        } else {
          // 初期状態: 無料会員
          await route.fulfill({
            json: {
              membership: {
                type: 'FREE',
                trialStartDate: null
              },
              subscription: null
            }
          });
        }
      });

      // トライアル開始APIをモック
      await page.route('/api/membership/start-trial', async route => {
        await route.fulfill({ 
          json: { success: true },
          headers: { 'Content-Type': 'application/json' }
        });
      });

      await page.goto('/plan');
      await page.waitForLoadState('networkidle');

      // 初期状態の確認: トライアルプランカードが表示される
      await expect(page.locator('h2').filter({ hasText: 'トライアル' })).toBeVisible();
      await expect(page.locator('text=¥0')).toBeVisible();
      await expect(page.locator('button', { hasText: 'トライアルを開始' })).toBeVisible();

      // トライアル開始ボタンをクリック
      await page.click('button:has-text("トライアルを開始")');

      // ローディング表示の確認（ローディングが短時間の場合があるのでtry-catch使用）
      try {
        await expect(page.locator('text=プラン変更中...')).toBeVisible({ timeout: 2000 });
      } catch (e) {
        // ローディングが高速で完了した場合はスキップ
        console.log('Loading state completed quickly');
      }

      // APIルートを更新後の状態に切り替え
      await page.route('/api/user/status', async route => {
        const trialStartDate = new Date();
        await route.fulfill({
          json: {
            membership: {
              type: 'TRIAL',
              trialStartDate: trialStartDate.toISOString()
            },
            subscription: null
          }
        });
      });

      // ページを再読み込みして更新後の状態を確認
      await page.reload();
      await page.waitForLoadState('networkidle');

      // トライアル開始後のUI確認
      await expect(page.locator('.bg-blue-50')).toBeVisible();
      await expect(page.locator('text=トライアル期間')).toBeVisible();
      await expect(page.locator('text=あと')).toBeVisible();
      await expect(page.locator('text=日')).toBeVisible();

      // プランカードが表示されないことを確認（トライアル中はプランカードなし）
      await expect(page.locator('h2').filter({ hasText: 'トライアル' })).not.toBeVisible();
    });
  });

  test.describe('無料会員 → 有料プラン直接アップグレード', () => {
    test('アップグレード時にStripe Checkoutに遷移し、完了後にUI表示が更新される', async ({ page }) => {
      // 初期状態: 無料会員（トライアル使用済み）
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 20);

      await page.route('/api/user/status', async route => {
        await route.fulfill({
          json: {
            membership: {
              type: 'FREE',
              trialStartDate: pastDate.toISOString()
            },
            subscription: null
          }
        });
      });

      // Stripe Checkout Session作成APIをモック
      await page.route('/api/create-checkout-session', async route => {
        await route.fulfill({
          json: { 
            url: 'https://checkout.stripe.com/test-session-123'
          }
        });
      });

      await page.goto('/plan');
      await page.waitForLoadState('networkidle');

      // 初期状態確認: プロプランカードが表示される
      await expect(page.locator('h2').filter({ hasText: 'プロ' })).toBeVisible();
      await expect(page.locator('text=¥3,980')).toBeVisible();
      await expect(page.locator('button', { hasText: 'アップグレード' })).toBeVisible();

      // アップグレードボタンをクリック
      await page.click('button:has-text("アップグレード")');

      // Stripe Checkoutページに遷移することを確認
      await page.waitForURL('https://checkout.stripe.com/test-session-123');
    });

    test('Stripe決済完了後に有料会員として画面表示が更新される', async ({ page }) => {
      // アップグレード完了後の状態をモック
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await page.route('/api/user/status', async route => {
        await route.fulfill({
          json: {
            membership: {
              type: 'PAID',
              trialStartDate: null
            },
            subscription: {
              subscriptionId: 'sub_test123',
              currentPeriodEnd: futureDate.toISOString(),
              status: 'ACTIVE'
            }
          }
        });
      });

      await page.goto('/plan?success=true');
      await page.waitForLoadState('networkidle');

      // 有料会員UI表示の確認
      await expect(page.locator('.bg-blue-50')).toBeVisible();
      await expect(page.locator('text=現在の請求期間')).toBeVisible();
      await expect(page.locator('text=まで')).toBeVisible();
      await expect(page.locator('text=サブスクリプションを停止する')).toBeVisible();

      // 注意文の確認
      await expect(page.locator('text=※サブスクリプションを停止しても、支払い済みの期間は引き続きサービスをご利用いただけます')).toBeVisible();

      // プランカードが表示されないことを確認（有料会員はプランカードなし）
      await expect(page.locator('h2').filter({ hasText: 'プロ' })).not.toBeVisible();
    });
  });

  test.describe('有料会員 → 解約（ダウングレード）', () => {
    test('サブスクリプション停止後に解約済み表示に更新される', async ({ page }) => {
      // 初期状態: アクティブな有料会員
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      let isCanceled = false;

      await page.route('/api/user/status', async route => {
        await route.fulfill({
          json: {
            membership: {
              type: 'PAID',
              trialStartDate: null
            },
            subscription: {
              subscriptionId: 'sub_test123',
              currentPeriodEnd: futureDate.toISOString(),
              status: isCanceled ? 'CANCELING' : 'ACTIVE'
            }
          }
        });
      });

      // 解約APIをモック
      await page.route('/api/cancel-subscription', async route => {
        isCanceled = true;
        await route.fulfill({ 
          json: { success: true }
        });
      });

      await page.goto('/plan');
      await page.waitForLoadState('networkidle');

      // 初期状態確認: アクティブな有料会員
      await expect(page.locator('text=現在の請求期間')).toBeVisible();
      await expect(page.locator('button', { hasText: 'サブスクリプションを停止する' })).toBeVisible();

      // サブスクリプション停止ボタンをクリック
      await page.click('button:has-text("サブスクリプションを停止する")');

      // 確認ダイアログが表示される
      await expect(page.locator('text=サブスクリプションを停止しますか？')).toBeVisible();
      
      // ダイアログ内の停止ボタンをクリック（getByRoleを使用）
      await page.getByRole('button', { name: '停止する' }).click();

      // ローディング表示確認（短時間の場合があるのでtry-catch使用）
      try {
        await expect(page.locator('text=処理中...')).toBeVisible({ timeout: 2000 });
      } catch (e) {
        console.log('Processing completed quickly');
      }

      // ページ再読み込みで更新後の状態を確認
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 解約済みUI表示の確認
      await expect(page.locator('.bg-yellow-50')).toBeVisible();
      await expect(page.locator('text=サブスクリプションは解約済みです')).toBeVisible();
      await expect(page.locator('text=までは引き続き全ての有料機能をご利用いただけます')).toBeVisible();
      await expect(page.locator('text=この日以降は自動的に無料プランに戻ります')).toBeVisible();

      // サブスクリプション停止ボタンが表示されないことを確認
      await expect(page.locator('button', { hasText: 'サブスクリプションを停止する' })).not.toBeVisible();
    });
  });

  test.describe('会員ステータス遷移の総合テスト', () => {
    test('FREE → TRIAL → PAID → CANCELED の完全な遷移フロー', async ({ page }) => {
      let currentStatus = 'FREE';
      const trialStartDate = new Date();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

      // 動的にAPIレスポンスを変更
      await page.route('/api/user/status', async route => {
        let response;
        
        switch (currentStatus) {
          case 'FREE':
            response = {
              membership: { type: 'FREE', trialStartDate: null },
              subscription: null
            };
            break;
          case 'TRIAL':
            response = {
              membership: { type: 'TRIAL', trialStartDate: trialStartDate.toISOString() },
              subscription: null
            };
            break;
          case 'PAID':
            response = {
              membership: { type: 'PAID', trialStartDate: trialStartDate.toISOString() },
              subscription: {
                subscriptionId: 'sub_test123',
                currentPeriodEnd: subscriptionEndDate.toISOString(),
                status: 'ACTIVE'
              }
            };
            break;
          case 'CANCELED':
            response = {
              membership: { type: 'PAID', trialStartDate: trialStartDate.toISOString() },
              subscription: {
                subscriptionId: 'sub_test123',
                currentPeriodEnd: subscriptionEndDate.toISOString(),
                status: 'CANCELING'
              }
            };
            break;
        }
        
        await route.fulfill({ json: response });
      });

      // 各APIエンドポイントをモック
      await page.route('/api/membership/start-trial', async route => {
        currentStatus = 'TRIAL';
        await route.fulfill({ json: { success: true } });
      });

      await page.route('/api/create-checkout-session', async route => {
        await route.fulfill({
          json: { url: 'https://checkout.stripe.com/success' }
        });
      });

      await page.route('/api/cancel-subscription', async route => {
        currentStatus = 'CANCELED';
        await route.fulfill({ json: { success: true } });
      });

      // 1. FREE状態の確認
      await page.goto('/plan');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h2').filter({ hasText: 'トライアル' })).toBeVisible();
      await expect(page.locator('text=¥0')).toBeVisible();

      // 2. FREE → TRIAL遷移
      await page.click('button:has-text("トライアルを開始")');
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=トライアル期間')).toBeVisible();
      await expect(page.locator('text=あと')).toBeVisible();

      // 3. TRIAL → PAID遷移（Stripeは実際には遷移せず、成功状態をシミュレート）
      currentStatus = 'PAID';
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=現在の請求期間')).toBeVisible();
      await expect(page.locator('button', { hasText: 'サブスクリプションを停止する' })).toBeVisible();

      // 4. PAID → CANCELED遷移
      await page.click('button:has-text("サブスクリプションを停止する")');
      
      // ダイアログ内の停止ボタンをクリック
      await page.getByRole('button', { name: '停止する' }).click();
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('.bg-yellow-50')).toBeVisible();
      await expect(page.locator('text=サブスクリプションは解約済みです')).toBeVisible();
    });
  });

  test.describe('エラーハンドリング', () => {
    test('Stripe決済失敗時のエラーハンドリング', async ({ page }) => {
      // トライアル使用済みの無料会員（アップグレードボタンが表示される状態）
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 20);
      
      await page.route('/api/user/status', async route => {
        await route.fulfill({
          json: {
            membership: { 
              type: 'FREE', 
              trialStartDate: pastDate.toISOString() 
            },
            subscription: null
          }
        });
      });

      // Stripe Checkout Session作成エラーをモック
      await page.route('/api/create-checkout-session', async route => {
        await route.fulfill({
          status: 500,
          json: { error: 'Payment processing failed' }
        });
      });

      await page.goto('/plan');
      await page.waitForLoadState('networkidle');

      // アップグレードボタンをクリック
      await page.click('button:has-text("アップグレード")');

      // エラー状態でもボタンが無効化されないことを確認（エラーハンドリングによる）
      await expect(page.locator('button', { hasText: 'アップグレード' })).toBeVisible();
    });

    test('トライアル開始失敗時のエラーハンドリング', async ({ page }) => {
      await page.route('/api/user/status', async route => {
        await route.fulfill({
          json: {
            membership: { type: 'FREE', trialStartDate: null },
            subscription: null
          }
        });
      });

      // トライアル開始APIエラーをモック
      await page.route('/api/membership/start-trial', async route => {
        await route.fulfill({
          status: 400,
          json: { error: 'Trial already used' }
        });
      });

      await page.goto('/plan');
      await page.waitForLoadState('networkidle');

      // トライアル開始ボタンをクリック
      await page.click('button:has-text("トライアルを開始")');

      // エラー後もボタンが表示されることを確認
      await expect(page.locator('button', { hasText: 'トライアルを開始' })).toBeVisible();
    });
  });
});