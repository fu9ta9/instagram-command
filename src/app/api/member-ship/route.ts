import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'
import { MembershipType } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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

    return NextResponse.json({ membershipType: effectiveMembershipType })
  } catch (error) {
    console.error('Failed to check user membership:', error)
    return NextResponse.json({ error: 'Failed to check user membership' }, { status: 500 })
  }
}