import { NextResponse } from 'next/server'
import { getSessionWrapper } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { MembershipType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSessionWrapper()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ユーザー情報と会員情報を一括取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let membershipType = user.membershipType as MembershipType
    let needsUpdate = false

    // トライアル期限チェック（一度だけ実行）
    if (membershipType === 'TRIAL' && user.trialStartDate) {
      const trialStart = new Date(user.trialStartDate)
      const now = new Date()
      const daysPassed = (now.getTime() - trialStart.getTime()) / (24 * 60 * 60 * 1000)
      
      if (daysPassed > 14) {
        // 期限切れの場合のみDBを更新
        await prisma.user.update({
          where: { id: session.user.id },
          data: { membershipType: 'FREE' }
        })
        membershipType = 'FREE'
        needsUpdate = true
      }
    }

    // サブスクリプション情報
    const subscription = user.subscription
    const subscriptionInfo = subscription ? {
      status: subscription.status,
      currentPeriodEnd: subscription.stripeCurrentPeriodEnd,
      subscriptionId: subscription.stripeSubscriptionId
    } : null

    // トライアル情報
    const trialInfo = membershipType === 'TRIAL' && user.trialStartDate ? {
      startDate: user.trialStartDate,
      endDate: new Date(user.trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      daysRemaining: Math.max(0, 14 - Math.floor((Date.now() - user.trialStartDate.getTime()) / (24 * 60 * 60 * 1000)))
    } : null

    return NextResponse.json({
      membership: {
        type: membershipType,
        trialStartDate: user.trialStartDate,
        updated: needsUpdate
      },
      subscription: subscriptionInfo,
      trial: trialInfo
    })

  } catch (error) {
    console.error('Status API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}