import { getSessionWrapper } from '@/lib/session';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getSessionWrapper();

  if (!session?.user?.id) {
    await prisma.executionLog.create({
      data: {
        errorMessage: 'Instagram Media取得: 認証エラー'
      }
    });
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // アクセストークンを取得
    const account = await prisma.iGAccount.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        accessToken: true,
      },
    });

    if (!account?.accessToken) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram Media取得: アクセストークンなし'
        }
      });
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Instagram Graph APIから投稿のメディアURLのみを取得
    const response = await fetch(
      `https://graph.instagram.com/v20.0/${params.postId}?fields=media_url,thumbnail_url&access_token=${account.accessToken}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagram Media取得エラー: ${JSON.stringify(errorData)}`
        }
      });
      throw new Error('Failed to fetch media data');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram Media取得エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
} 