import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { fetchInstagramPosts } from '@/lib/instagram';

// 動的ルートとしてマーク
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // URLからafterパラメータを取得
    const url = new URL(request.url);
    const afterToken = url.searchParams.get('after');

    // ユーザーのIGアカウントを取得
    const igAccount = await prisma.iGAccount.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!igAccount) {
      return NextResponse.json(
        { 
          error: 'Instagram business account not found',
          message: 'Instagramビジネスアカウントが連携されていません。連携設定を行ってください。'
        }, 
        { status: 404 }
      );
    }

    // Instagramの投稿を取得
    const posts = await fetchInstagramPosts(igAccount, afterToken);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch Instagram posts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Instagram posts',
        message: 'Instagramの投稿の取得に失敗しました。'
      }, 
      { status: 500 }
    );
  }
}
