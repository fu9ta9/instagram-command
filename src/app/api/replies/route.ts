import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    await prisma.executionLog.create({
      data: {
        errorMessage: 'Reply作成: 認証エラー - セッションが存在しません'
      }
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requestData = await request.json()
    await prisma.executionLog.create({
      data: {
        errorMessage: `Reply作成: リクエストデータ - ${JSON.stringify(requestData)}`
      }
    });

    // 必須フィールドの検証
    if (!requestData.keyword || !requestData.reply || !requestData.instagramPostId) {
      throw new Error('Required fields are missing');
    }

    const newReply = await prisma.reply.create({
      data: {
        keyword: requestData.keyword,
        reply: requestData.reply,
        userId: session.user.id,
        postId: requestData.instagramPostId,
        replyType: 1, // SPECIFIC_POST
        matchType: requestData.matchType === 'exact' ? 1 : 2, // 1: EXACT, 2: PARTIAL
        buttons: {
          create: requestData.buttons?.map((button: any, index: number) => ({
            title: button.title,
            url: button.url,
            order: index
          })) || []
        }
      },
      include: {
        buttons: true
      }
    })

    await prisma.executionLog.create({
      data: {
        errorMessage: `Reply作成: 成功 - ID: ${newReply.id}`
      }
    });

    return NextResponse.json(newReply)
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Reply作成エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json(
      { 
        error: 'Failed to create reply',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    console.log('認証エラー: セッションまたはユーザーIDが存在しません');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const replies = await prisma.reply.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}
