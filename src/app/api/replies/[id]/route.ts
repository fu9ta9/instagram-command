import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionWrapper } from '@/lib/session'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWrapper()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWrapper();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const replyId = parseInt(params.id);
    const data = await request.json();

    // 現在の返信を取得して、IGアカウントIDを確認
    const currentReply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: { igAccount: true }
    });

    if (!currentReply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // ユーザーが所有する返信かどうかを確認
    if (currentReply.igAccount.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // キーワードまたは投稿IDが変更された場合、重複チェック
    if (data.keyword !== currentReply.keyword || data.postId !== currentReply.postId) {
      const checkInfo = {
        replyId,
        currentKeyword: currentReply.keyword,
        newKeyword: data.keyword,
        currentPostId: currentReply.postId,
        newPostId: data.postId
      };

      // 既存の返信を確認（同じキーワードと投稿IDの組み合わせ）
      const existingReply = await prisma.reply.findFirst({
        where: {
          igAccountId: currentReply.igAccountId,
          keyword: data.keyword,
          postId: data.postId,
          id: { not: replyId } // 自分自身は除外
        }
      });

      await prisma.executionLog.create({
        data: {
          errorMessage: `重複チェック結果: ${existingReply ? '重複あり' : '重複なし'}, ID: ${existingReply?.id || 'なし'}`
        }
      });

      if (existingReply) {
        return NextResponse.json({ 
          error: 'Duplicate reply',
          details: '同じキーワードと投稿IDの組み合わせが既に登録されています'
        }, { status: 409 }); // 409 Conflict
      }
    }

    // 更新データを準備
    const updateData = {
      keyword: data.keyword,
      reply: data.reply,
      matchType: data.matchType,
      postId: data.postId,
      // 他のフィールドも必要に応じて更新
    };

    // ボタンの更新処理
    if (data.buttons) {
      // 既存のボタンを削除
      await prisma.button.deleteMany({
        where: { replyId: replyId }
      });

      // 新しいボタンを作成
      await Promise.all(data.buttons.map((button: any, index: number) => {
        return prisma.button.create({
          data: {
            replyId: replyId,
            title: button.title,
            url: button.url,
            order: index
          }
        });
      }));
    }

    // 返信を更新
    const updatedReply = await prisma.reply.update({
      where: { id: replyId },
      data: updateData,
      include: { buttons: true }
    });

    await prisma.executionLog.create({
      data: {
        errorMessage: `返信更新成功: ID ${replyId}`
      }
    });

    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error('Failed to update reply:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to update reply', 
      details: errorMessage 
    }, { status: 500 });
  }
}
