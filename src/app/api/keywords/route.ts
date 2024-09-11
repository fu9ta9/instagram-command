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
    const { keyword, reply } = await request.json()

    const newKeyword = await prisma.keyword.create({
      data: {
        keyword,
        reply,
        userId: session.user.id,
      },
    })
    return NextResponse.json(newKeyword)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create keyword'}, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keywords = await prisma.keyword.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(keywords)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch keywords'}, { status: 500 })
  }
}