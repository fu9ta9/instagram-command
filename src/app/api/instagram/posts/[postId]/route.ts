import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { getInstagramAccessToken, getInstagramAccount } from '@/lib/instagram';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram Media取得: 認証エラー'
        }
      });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // IGAccountの取得を試みる
    const igAccount = await getInstagramAccount(session.user.id);

    if (!igAccount) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram Media取得: IGAccountが見つかりません'
        }
      });
      return NextResponse.json({ error: 'IGAccount not found' }, { status: 404 });
    }

    // アクセストークンを取得
    const accessToken = await getInstagramAccessToken(session.user.id);

    if (!accessToken) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram Media取得: アクセストークンなし'
        }
      });
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Instagram Graph APIから投稿のメディアURLのみを取得
    const response = await fetch(
      `https://graph.instagram.com/v20.0/${params.postId}?fields=media_url,thumbnail_url&access_token=${accessToken}`
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
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram Media取得成功: PostID ${params.postId}`
      }
    });

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