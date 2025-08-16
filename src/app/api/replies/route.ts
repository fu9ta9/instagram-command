import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionWrapper } from '@/lib/session'

export async function POST(request: NextRequest) {
  
  try {
    
    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // IGAccountを取得
    const igAccount = await prisma.iGAccount.findFirst({
      where: { 
        userId: session.user.id 
      },
      select: {
        id: true
      }
    });

    if (!igAccount) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    const data = await request.json()

    // 既存の返信を確認（同じキーワードと投稿IDの組み合わせ）
    const existingReply = await prisma.reply.findFirst({
      where: {
        igAccountId: igAccount.id,
        keyword: data.keyword,
        postId: data.postId,
        replyType: data.replyType || 2
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
      commentReplyEnabled: data.commentReplyEnabled,
      postId: data.postId,
      igAccountId: igAccount.id,
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

    // ReplyStatsを初期化して作成
    await prisma.replyStats.create({
      data: {
        replyId: reply.id,
        sentCount: 0,
        readCount: 0
      }
    });

    console.log(`ReplyStats initialized for Reply ID: ${reply.id}`);

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Failed to create reply:', error)
    return NextResponse.json({ 
      error: 'Failed to create reply'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // IGAccountを取得
    const igAccount = await prisma.iGAccount.findFirst({
      where: { 
        userId: session.user.id 
      },
      select: {
        id: true
      }
    });

    if (!igAccount) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    // クエリパラメータからtypeを取得
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // typeに応じてreplyTypeを設定
    let replyTypeFilter = {}
    if (type === 'post') {
      replyTypeFilter = { replyType: 1 }
    } else if (type === 'story') {
      replyTypeFilter = { replyType: 2 }
    } else if (type === 'live') {
      replyTypeFilter = { replyType: 3 }
    }
    // typeが指定されていない場合は全ての返信を取得

    const replies = await prisma.reply.findMany({
      where: {
        igAccountId: igAccount.id,
        ...replyTypeFilter
      },
      include: {
        buttons: {
          orderBy: {
            order: 'asc'
          }
        },
        stats: true
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
