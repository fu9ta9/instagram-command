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
    const keyword = await prisma.keyword.findUnique({
      where: { id },
    })

    if (!keyword || keyword.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.keyword.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Keyword deleted successfully' })
  } catch (error) {
    console.error('Failed to delete keyword:', error)
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 })
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
  const { keyword, reply } = await request.json()

  try {
    const existingKeyword = await prisma.keyword.findUnique({
      where: { id },
    })

    if (!existingKeyword || existingKeyword.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updatedKeyword = await prisma.keyword.update({
      where: { id },
      data: { keyword, reply },
    })

    return NextResponse.json(updatedKeyword)
  } catch (error) {
    console.error('Failed to update keyword:', error)
    return NextResponse.json({ error: 'Failed to update keyword' }, { status: 500 })
  }
}