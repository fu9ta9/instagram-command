import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/options'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id)

  try {
    const reply = await prisma.reply.findUnique({
      where: { id },
    })

    if (!reply || reply.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.reply.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Reply deleted successfully' })
  } catch (error) {
    console.error('Failed to delete reply:', error)
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id)
  const { keyword, reply, postId, replyType, matchType, buttons } = await request.json()

  try {
    const existingReply = await prisma.reply.findUnique({
      where: { id },
    })

    if (!existingReply || existingReply.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updatedReply = await prisma.reply.update({
      where: { id },
      data: { 
        keyword, 
        reply, 
        postId, 
        replyType, 
        matchType,
        buttons: {
          deleteMany: {},
          create: buttons
        }
      },
      include: { buttons: true },
    })

    return NextResponse.json(updatedReply)
  } catch (error) {
    console.error('Failed to update reply:', error)
    return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 })
  }
}
