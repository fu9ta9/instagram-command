import { getSessionWrapper } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MembershipType } from '@prisma/client'

export async function GET() {
  try {
    const session = await getSessionWrapper()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { membershipType: true, trialStartDate: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let effectiveMembershipType = user.membershipType

    // トライアル期間のチェック
    if (user.membershipType === MembershipType.TRIAL && user.trialStartDate) {
      const trialEndDate = new Date(user.trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000) // 14日後
      if (new Date() > trialEndDate) {
        effectiveMembershipType = MembershipType.FREE
        // ユーザーの会員種別を更新
        await prisma.user.update({
          where: { email: session.user.email },
          data: { membershipType: MembershipType.FREE }
        })
      }
    }

    return NextResponse.json({ 
      message: 'Membership data retrieved successfully',
      user: session.user,
      membershipType: effectiveMembershipType
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}