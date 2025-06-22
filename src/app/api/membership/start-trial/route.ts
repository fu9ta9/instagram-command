import { NextResponse } from 'next/server'
import { getSessionWrapper } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 既にトライアルを使用していないか確認
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { membershipType: true }
    })

    if (user?.membershipType !== 'FREE') {
      return new NextResponse("Trial is only available for free users", { status: 400 })
    }

    // トライアル開始
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        membershipType: 'TRIAL',
        trialStartDate: new Date(),
      }
    })

    return NextResponse.json({ 
      message: 'Trial started successfully',
      trialStartDate: new Date()
    })
  } catch (error) {
    console.error('Trial start error:', error)
    await prisma.executionLog.create({
      data: {
        errorMessage: `Trial start error: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    return new NextResponse("Internal error", { status: 500 })
  }
} 