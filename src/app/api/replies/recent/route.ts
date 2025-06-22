import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionWrapper } from '@/lib/session'

// 動的ルートとしてマーク
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 10

    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // まず、ユーザーのIGアカウントを取得
    const igAccounts = await prisma.iGAccount.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (igAccounts.length === 0) {
      return NextResponse.json([]);
    }

    // IGアカウントIDを使用して返信を取得
    const replies = await prisma.reply.findMany({
      where: {
        igAccountId: igAccounts[0].id, // 最初のIGアカウントを使用
      },
      include: {
        buttons: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Failed to fetch recent replies:', error)
    // エラーの詳細情報を返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to fetch recent replies', 
      details: errorMessage,
      stack: errorStack 
    }, { status: 500 })
  }
} 