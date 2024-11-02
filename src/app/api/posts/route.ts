import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('GET開始');
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) { 
    console.log('認証エラー: セッションまたはユーザーIDが存在しません');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Accountテーブルからアクセストークンを取得
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
      console.log('アカウントエラー: Facebookアカウントが接続されていないか、アクセストークンが見つかりません');
      return NextResponse.json({ error: 'Facebook account not connected' }, { status: 401 });
    }

    // Instagram Business AccountのIDを取得
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id}&access_token=${account.access_token}`
    );
    
    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.error('Facebook APIエラー:', errorData);
      return NextResponse.json({ error: 'Failed to fetch Instagram account', details: errorData }, { status: accountResponse.status });
    }

    const accountData = await accountResponse.json();
    console.log('Facebook APIレスポンス:', accountData);

    const instagramAccountId = accountData.data[0]?.instagram_business_account?.id;

    if (!instagramAccountId) {
      console.log('アカウントエラー: Instagramビジネスアカウントが見つかりません');
      return NextResponse.json({ error: 'Instagram business account not found' }, { status: 404 });
    }

    // 投稿を取得
    const postsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,media_type,media_url,thumbnail_url,timestamp&access_token=${account.access_token}`
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      console.error('Instagram APIエラー:', errorData);
      return NextResponse.json({ error: 'Failed to fetch Instagram posts', details: errorData }, { status: postsResponse.status });
    }

    const postsData = await postsResponse.json();
    console.log('Instagram投稿データ:', postsData);

    return NextResponse.json(postsData.data);
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram posts', details: error }, { status: 500 });
  }
}
