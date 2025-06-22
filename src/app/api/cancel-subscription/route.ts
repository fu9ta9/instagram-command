import { stripe } from '@/lib/stripe'
import { getSessionWrapper } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: "アクティブなサブスクリプションが見つかりません" }, { status: 404 })
    }

    // サブスクリプションを「期間終了後にキャンセル」予約
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // データベースのステータスを更新
    await prisma.userSubscription.update({
      where: { userId: session.user.id },
      data: {
        status: 'CANCELING'
      }
    })

    return NextResponse.json({ message: "サブスクリプションのキャンセルが完了しました" })

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json({ 
      error: "サブスクリプションのキャンセルに失敗しました",
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
} 