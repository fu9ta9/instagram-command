import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
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
    // Facebookアカウント情報を取得
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        access_token: true,
      },
    });

    if (!account?.access_token) {
      await logExecution('アカウントエラー', 'アクセストークンが見つかりません');
      return NextResponse.json({ 
        error: 'Facebook account not connected',
        message: 'Facebookアカウントが接続されていません。'
      }, { status: 401 });
    }

    // まずInstagram Business Account IDを取得
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id}&access_token=${account.access_token}`
    );

    if (!igAccountResponse.ok) {
      const errorData = await igAccountResponse.json();
      await logExecution('Instagram Account APIエラー', JSON.stringify(errorData));
      return NextResponse.json({ error: errorData }, { status: igAccountResponse.status });
    }

    const igAccountData = await igAccountResponse.json();
    const igBusinessAccountId = igAccountData.data?.[0]?.instagram_business_account?.id;

    if (!igBusinessAccountId) {
      await logExecution('Instagram Business Account IDが見つかりません');
      return NextResponse.json({
        error: 'Instagram business account not found',
        message: 'Instagramビジネスアカウントが見つかりません。'
      }, { status: 404 });
    }

    // Instagram投稿を取得
    const postsResponse = await fetch(
      `https://graph.facebook.com/v20.0/${igBusinessAccountId}/media?fields=id,comments_count,like_count,media_product_type,media_url,thumbnail_url,timestamp&access_token=${account.access_token}`
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      await logExecution('Instagram Posts APIエラー', JSON.stringify(errorData));
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
    await logExecution('Instagram投稿データ取得成功', 
      `Business Account ID: ${igBusinessAccountId.substring(0, 5)}...`
    );

    return NextResponse.json(postsData.data);
  } catch (error) {
    await logExecution('Error', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
