import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.instagram) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const igAccountId = session.user.instagram.id;

    // 既存の返信を確認（同じキーワードと投稿IDの組み合わせ）
    const existingReply = await prisma.reply.findFirst({
      where: {
        igAccountId,
        keyword: data.keyword,
        postId: data.postId
      }
    });

    if (existingReply) {
      return NextResponse.json({ 
        error: 'Duplicate reply',
        details: '同じキーワードと投稿IDの組み合わせが既に登録されています'
      }, { status: 409 });
    }

    // データを適切な形式に変換
    const replyData = {
      keyword: data.keyword,
      reply: data.reply,
      replyType: data.replyType || 2,
      matchType: data.matchType === 'exact' ? 1 : 2,
      postId: data.postId,
      igAccountId,
      buttons: {
        create: data.buttons?.map((button: any, index: number) => ({
          title: button.title,
          url: button.url,
          order: index
        })) || []
      }
    };

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
    return NextResponse.json({ 
      error: 'Failed to create reply'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.instagram) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const replies = await prisma.reply.findMany({
      where: {
        igAccountId: session.user.instagram.id
      },
      include: {
        buttons: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(replies);
  } catch (error) {
    console.error('Failed to fetch replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}
