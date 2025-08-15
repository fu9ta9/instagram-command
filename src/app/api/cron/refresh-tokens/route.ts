import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// エラーログを安全に記録する関数
async function safeLogError(message: string) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: message
      }
    });
  } catch (dbError) {
    console.error('DB接続エラー:', dbError);
    console.error('元のエラー:', message);
  }
}

export async function GET(request: Request) {
  try {
    // Vercel Cronからのリクエスト認証
    const authHeader = headers().get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      await safeLogError('Cron job: 認証失敗 - 不正なアクセス');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 40日以内に期限切れとなるアカウントを取得
    const fortyDaysFromNow = Math.floor(Date.now() / 1000) + (40 * 24 * 60 * 60);
    
    const accountsToRefresh = await prisma.iGAccount.findMany({
      where: {
        expiresAt: {
          lt: fortyDaysFromNow,
          not: null
        }
      },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });

    const results = {
      timestamp: new Date().toISOString(),
      total: accountsToRefresh.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ userId: string, username: string, error: string }>
    };

    await safeLogError(`Cron job開始: ${results.total}件のアカウントを処理予定`);

    // 各アカウントのトークンを更新
    for (const account of accountsToRefresh) {
      try {
        const newTokenData = await refreshInstagramToken(account.accessToken!, account.id);
        results.success++;
        
        await safeLogError(`トークン更新成功: userId=${account.userId}, username=${account.username}, 新期限=${new Date(newTokenData.expiresAt * 1000).toISOString()}`);
        
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push({
          userId: account.userId,
          username: account.username,
          error: errorMessage
        });
        
        await safeLogError(`トークン更新失敗: userId=${account.userId}, username=${account.username}, error=${errorMessage}`);
        
        // 更新失敗時はユーザーに再認証を促す処理
        try {
          await handleTokenRefreshFailure(account);
        } catch (notifyError) {
          await safeLogError(`ユーザー通知送信失敗: userId=${account.userId}, error=${notifyError instanceof Error ? notifyError.message : String(notifyError)}`);
        }
      }
    }

    await safeLogError(`Cron job完了: 成功=${results.success}, 失敗=${results.failed}`);

    return NextResponse.json(results);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await safeLogError(`Cron job実行エラー: ${errorMessage}`);
    
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Instagram トークン更新関数
async function refreshInstagramToken(currentToken: string, accountId: string) {
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Instagram API エラー: ${JSON.stringify(data)}`);
  }

  if (!data.access_token || !data.expires_in) {
    throw new Error(`Invalid response from Instagram API: ${JSON.stringify(data)}`);
  }
  
  // DBのトークン情報を更新
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
  await prisma.iGAccount.update({
    where: { id: accountId },
    data: {
      accessToken: data.access_token,
      expiresAt: expiresAt,
      updatedAt: new Date()
    }
  });

  return {
    accessToken: data.access_token,
    expiresAt: expiresAt
  };
}

// トークン更新失敗時の処理
async function handleTokenRefreshFailure(account: any) {
  // アカウントを一時無効化（トークンはクリアしない - 手動で確認できるように）
  await prisma.iGAccount.update({
    where: { id: account.id },
    data: {
      // accessToken: null, // とりあえずクリアしない
      updatedAt: new Date()
    }
  });

  // TODO: ここでユーザーにメール通知やアプリ内通知を送信
  // 現在はログのみ記録
  await safeLogError(`要ユーザー対応: userId=${account.userId}のInstagramトークンが更新できませんでした。再認証が必要です。`);
}

// 手動実行用エンドポイント（開発・テスト用）
export async function POST(request: Request) {
  try {
    // 管理者認証（本番では適切な認証を実装）
    const authHeader = headers().get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (userId) {
      // 特定ユーザーのトークンのみ更新
      const account = await prisma.iGAccount.findFirst({
        where: { userId },
        include: { user: true }
      });

      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      try {
        const newTokenData = await refreshInstagramToken(account.accessToken!, account.id);
        return NextResponse.json({ 
          success: true, 
          userId,
          newExpiresAt: new Date(newTokenData.expiresAt * 1000).toISOString()
        });
      } catch (error) {
        await handleTokenRefreshFailure(account);
        return NextResponse.json({ 
          error: 'Token refresh failed', 
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    } else {
      // 全ユーザーのトークンを更新（GET と同じ処理）
      return GET(request);
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Manual refresh failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}