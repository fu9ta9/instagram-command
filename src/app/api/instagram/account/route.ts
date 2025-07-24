import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionWrapper } from '@/lib/session';
import { fetchInstagramProfilePicture } from '@/lib/instagram';

export async function GET(request: Request) {
  const session = await getSessionWrapper();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // セッションのユーザーIDと要求されたユーザーIDが一致することを確認
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const account = await prisma.iGAccount.findFirst({
      where: { userId },
      select: {
        id: true,
        instagramId: true,
        username: true,
        profilePictureUrl: true,
        accessToken: true
      }
    });

    if (!account) {
      return NextResponse.json({ account: null });
    }

    // Instagram APIから最新のプロフィール画像URLを取得
    const latestProfilePictureUrl = await fetchInstagramProfilePicture(
      account.username,
      account.accessToken,
      account.instagramId
    );

    // 最新のプロフィール画像URLまたはDBの古いURLを使用
    const profilePictureUrl = latestProfilePictureUrl || account.profilePictureUrl;

    return NextResponse.json({ 
      account: {
        id: account.id,
        username: account.username,
        profilePictureUrl: profilePictureUrl
      }
    });
  } catch (error) {
    console.error('Error fetching Instagram account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram account' },
      { status: 500 }
    );
  }
} 