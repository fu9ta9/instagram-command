import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { keyword, reply, postId, replyType, matchType } = await request.json()

    const newReply = await prisma.reply.create({
      data: {
        keyword,
        reply,
        userId: session.user.id,
        postId,
        replyType,
        matchType,
      },
    })
    return NextResponse.json(newReply)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reply'}, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const replies = await prisma.reply.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { buttons: true },
    })
    return NextResponse.json(replies)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch replies'}, { status: 500 })
  }
}
