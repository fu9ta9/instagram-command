import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function fetchInstagramAccountData(accessToken: string) {
    const response = await fetch(
        `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,name,username}&access_token=${accessToken}`
    );

    if (!response.ok) {
        const errorData = await response.json();
        await logExecution('Facebook APIエラー', JSON.stringify(errorData));
        throw new Error('Failed to fetch Instagram account');
    }

    return await response.json();
}

async function logExecution(message: string, error?: string) {
  try {
    await prisma.executionLog.create({
      data: { 
        errorMessage: error ? `${message}: ${error}` : message
      }
    });
  } catch (e) {
    console.error('ログの記録中にエラーが発生しました:', e instanceof Error ? e.message : String(e));
  }
}

export async function GET() {
  await logExecution('GET開始');
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) { 
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        access_token: true,
        scope: true,
      },
    });

    if (!account?.access_token) {
      return NextResponse.json({ 
        error: 'Facebook account not connected',
        message: 'Facebookアカウントが接続されていません。ログインしてください。'
      }, { status: 401 });
    }

    // スコープのチェック
    const requiredScopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ];

    const currentScopes = account.scope?.split(',') || [];
    const missingScopes = requiredScopes.filter(scope => !currentScopes.includes(scope));

    // if (missingScopes.length > 0) {
    //   return NextResponse.json({
    //     error: 'Insufficient permissions',
    //     message: '必要な権限が不足しています。再度ログインして権限を付与してください。',
    //     missingScopes
    //   }, { status: 403 });
    // }

    // アカウントデータの詳細な確認
    const accountDetails = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        id: true,
        access_token: true,
        providerAccountId: true,
        scope: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
    });

    await logExecution('アカウント詳細', JSON.stringify(accountDetails));

    if (!accountDetails?.access_token) {
      await logExecution('アカウントエラー', 'Facebookアカウントが接続されていないか、アクセストークンが見つかりません');
      return NextResponse.json({ 
        error: 'Facebook account not connected', 
        message: 'Facebookアカウントが接続されていません。以下を確認してください：\n1. Facebookログインが完了ていること\n2. 必要な権限が付与されていること' 
      }, { status: 401 });
    }

    // データベースアクセスの前にセッションの有効性を再確認
    const tmpAccountData = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        access_token: true,
      },
    });

    if (!tmpAccountData?.access_token) {
      console.log('アカウントエラー: Facebookアカウントが接続されていないか、アクセストークンが見つかりません');
      return NextResponse.json(
        { error: 'Facebook account not connected', message: 'Facebookアカウントが接続されていません。設定画面からFacebookアカウントを接続してください。' }, 
        { status: 401 }
      );
    }




    // 投稿を取得
    const postsResponse = await fetch(
      'https://graph.facebook.com/v20.0/17841447969868460/media?fields=id,comments_count,like_count,media_product_type,media_url,thumbnail_url,timestamp&access_token=EAA0daofnui4BO1GfArcl5j8uq6wvppbL8ASSfg6V97i1SxGLuH3iKeYJWaOnv9djnbG3WLoWsnKMdlrwaMYscvRCuEkNiBZCEiQQxtvzEpgZAHsu1eqTtnee8tjb86CyBAZCE13NbVslqapClG6FGKjskPF5IJcj0nJjC0YJAQURLDO8Wl8ypfJT7PegwrY'
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      await logExecution('Instagram APIエラー', JSON.stringify(errorData));
      return NextResponse.json(
        { 
          error: 'Failed to fetch Instagram posts', 
          message: 'Instagram投稿の取得に失敗しました。',
          details: errorData 
        }, 
        { status: postsResponse.status }
      );
    }

    const postsData = await postsResponse.json();
    await logExecution('Instagram投稿データ', JSON.stringify(postsData));


    return NextResponse.json(postsData.data);
  } catch (error) {
    await logExecution('Error', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
