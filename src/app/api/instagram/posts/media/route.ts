import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

// 動的ルートとしてマーク
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const postIds = url.searchParams.get('post_ids')?.split(',');

    if (!postIds || postIds.length === 0) {
      return NextResponse.json({ error: 'Post IDs are required' }, { status: 400 });
    }

    // アクセストークンのみを取得
    const account = await prisma.iGAccount.findFirst({
      where: { 
        userId: session.user.id 
      },
      select: { 
        accessToken: true 
      }
    });

    if (!account?.accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // 各投稿のメディアURLを取得
    const mediaUrls: Record<string, string> = {};
    for (const postId of postIds) {
      const response = await fetch(
        `https://graph.instagram.com/v20.0/${postId}?fields=media_url,thumbnail_url&access_token=${account.accessToken}`
      );
      if (response.ok) {
        const data = await response.json();
        mediaUrls[postId] = data.thumbnail_url || data.media_url;
      }
    }

    return NextResponse.json(mediaUrls);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 