import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('受信データ:', data);

    // ユーザーのIGアカウントを取得
    const igAccounts = await prisma.iGAccount.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (igAccounts.length === 0) {
      return NextResponse.json({ 
        error: 'No Instagram account found',
        details: 'Instagram account is required to create a reply'
      }, { status: 400 });
    }

    const igAccountId = igAccounts[0].id;

    // データを適切な形式に変換
    const replyData = {
      keyword: data.keyword,
      reply: data.reply,
      replyType: data.replyType || 2, // デフォルト値
      matchType: data.matchType === 'exact' ? 1 : 2,
      postId: data.instagramPostId,
      igAccountId: igAccountId, // IGアカウントIDを設定
      buttons: {
        create: data.buttons?.map((button: any, index: number) => ({
          title: button.title,
          url: button.url,
          order: index
        })) || []
      }
    };

    console.log('保存データ:', replyData);

    // 返信を作成
    const reply = await prisma.reply.create({
      data: replyData,
      include: {
        buttons: true
      }
    });

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Failed to create reply:', error)
    // エラーの詳細情報を返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to create reply', 
      details: errorMessage,
      stack: errorStack 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザーのIGアカウントを取得
    const igAccounts = await prisma.iGAccount.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (igAccounts.length === 0) {
      return NextResponse.json([]);
    }

    const igAccountId = igAccounts[0].id;

    // 返信を取得
    const replies = await prisma.reply.findMany({
      where: {
        igAccountId: igAccountId,
      },
      include: {
        buttons: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Failed to fetch replies:', error)
    // エラーの詳細情報を返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch replies', 
      details: errorMessage 
    }, { status: 500 })
  }
}
