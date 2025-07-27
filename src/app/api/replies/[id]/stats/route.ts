import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionWrapper } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const replyId = parseInt(params.id)
    if (isNaN(replyId)) {
      return NextResponse.json({ error: 'Invalid reply ID' }, { status: 400 })
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

    // 返信が存在し、ユーザーのものかを確認
    const reply = await prisma.reply.findFirst({
      where: {
        id: replyId,
        igAccountId: igAccount.id
      },
      select: {
        id: true
      }
    });

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // ReplyStatsを取得
    let replyStats = await prisma.replyStats.findUnique({
      where: {
        replyId: replyId
      }
    });

    // ReplyStatsが存在しない場合は作成
    if (!replyStats) {
      replyStats = await prisma.replyStats.create({
        data: {
          replyId: replyId,
          sentCount: 0,
          readCount: 0
        }
      });
      console.log(`ReplyStats created for existing Reply ID: ${replyId}`);
    }

    // 既読率を計算
    const readRate = replyStats.sentCount > 0 
      ? Math.round((replyStats.readCount / replyStats.sentCount) * 100 * 10) / 10 // 小数点第1位まで
      : 0;

    // レスポンスデータを作成
    const statsData = {
      sentCount: replyStats.sentCount,
      readCount: replyStats.readCount,
      readRate: readRate,
      unreadCount: replyStats.sentCount - replyStats.readCount,
      lastUpdated: replyStats.lastUpdated.toISOString()
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Failed to fetch reply stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reply stats'
    }, { status: 500 });
  }
}