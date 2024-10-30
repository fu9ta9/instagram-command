import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
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
      return NextResponse.json({ error: 'Facebook account not connected' }, { status: 401 });
    }

    // Instagram Business AccountのIDを取得
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id}&access_token=${account.access_token}`
    );
    const accountData = await accountResponse.json();
    const instagramAccountId = accountData.data[0]?.instagram_business_account?.id;

    if (!instagramAccountId) {
      return NextResponse.json({ error: 'Instagram business account not found' }, { status: 404 });
    }

    // 投稿を取得
    const postsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,media_type,media_url,thumbnail_url,timestamp&access_token=${account.access_token}`
    );
    const postsData = await postsResponse.json();

    return NextResponse.json(postsData.data);
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 });
  }
}
