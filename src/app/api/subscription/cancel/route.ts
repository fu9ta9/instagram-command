import { getSessionWrapper } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getSessionWrapper()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ユーザーのサブスクリプション情報を取得
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id }
    })

    if (!subscription) {
      return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 404 })
    }

    // Stripeでサブスクリプションをキャンセル
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)

    await prisma.executionLog.create({
      data: {
        errorMessage: `Subscription cancelled by user: ${session.user.id}`
      }
    })

    return NextResponse.json({ message: "サブスクリプションをキャンセルしました" })

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json({ 
      error: "キャンセル処理に失敗しました",
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
} 