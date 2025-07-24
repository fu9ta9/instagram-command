import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MembershipType } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    
    // クライアント側で既に認証済みのセッションを信頼し、サーバー側での認証チェックは省略
    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, membershipType: true, trialStartDate: true }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    // TRIALかつ期限切れか判定
    if (user.membershipType === 'TRIAL' && user.trialStartDate) {
      const trialStart = new Date(user.trialStartDate)
      const now = new Date()
      const diff = now.getTime() - trialStart.getTime()
      if (diff > 14 * 24 * 60 * 60 * 1000) {
        // FREEに更新
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { membershipType: MembershipType.FREE }
        })
        return NextResponse.json({
          membershipType: updated.membershipType,
          trialStartDate: updated.trialStartDate,
          status: null
        })
      }
    }
    // 期限切れでなければ現状の情報を返す
    return NextResponse.json({
      membershipType: user.membershipType,
      trialStartDate: user.trialStartDate,
      status: null
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 