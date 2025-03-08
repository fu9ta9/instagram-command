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
      include: { buttons: true }, // ボタンも取得
    })

    if (!reply) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // トランザクションで削除処理を行う
    await prisma.$transaction(async (tx) => {
      // 関連するボタンを先に削除
      if (reply.buttons && reply.buttons.length > 0) {
        await tx.button.deleteMany({
          where: { replyId: id }
        });
      }
      
      // 返信を削除
      await tx.reply.delete({
        where: { id },
      });
    });

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
      include: { buttons: true },
    })

    if (!existingReply) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // トランザクションで更新処理を行う
    const updatedReply = await prisma.$transaction(async (tx) => {
      // 既存のボタンを削除
      await tx.button.deleteMany({
        where: { replyId: id }
      });
      
      // 返信を更新
      const updated = await tx.reply.update({
        where: { id },
        data: { 
          keyword, 
          reply, 
          postId, 
          replyType, 
          matchType
        }
      });
      
      // 新しいボタンを作成
      if (buttons && buttons.length > 0) {
        await tx.button.createMany({
          data: buttons.map((button: any) => ({
            replyId: id,
            title: button.title,
            url: button.url,
            order: button.order
          }))
        });
      }
      
      // 更新された返信とボタンを取得
      return tx.reply.findUnique({
        where: { id },
        include: { buttons: true }
      });
    });

    return NextResponse.json(updatedReply)
  } catch (error) {
    console.error('Failed to update reply:', error)
    return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 })
  }
}
