import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInstagramReply } from '@/lib/instagramApi'

// Webhook検証用のGETエンドポイント
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // 検証トークンの確認
    if (mode === 'subscribe' && token === process.env.NEXT_PUBLIC_WEBHOOK_VERIFY_TOKEN) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Webhook検証成功: challenge=${challenge}`
        }
      });
      return new Response(challenge, { status: 200 });
    }

    await prisma.executionLog.create({
      data: {
        errorMessage: `Webhook検証失敗: mode=${mode}, token=${token}`
      }
    });
    return new Response('Forbidden', { status: 403 });
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Webhook検証エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return new Response('Internal Server Error', { status: 500 });
  }
}

// コメント受信用のPOSTエンドポイント
export async function POST(request: Request) {
  try {
    const webhookData = await request.json();
    
    // リクエストの受信をログに記録
    await prisma.executionLog.create({
      data: {
        errorMessage: `Webhookコメント受信: ${JSON.stringify(webhookData)}`
      }
    });

    // コメントデータの検証
    if (!webhookData.entry?.[0]?.changes?.[0]?.value) {
      throw new Error('Invalid webhook data format');
    }

    // コメントデータの処理を非同期で実行
    processInstagramComment(webhookData).catch(error => {
      prisma.executionLog.create({
        data: {
          errorMessage: `コメント処理エラー: ${error instanceof Error ? error.message : String(error)}`
        }
      });
    });

    return NextResponse.json({ message: 'Accepted' }, { status: 202 });

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Webhookエラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// コメント処理の非同期関数
async function processInstagramComment(webhookData: any) {
  const commentData = webhookData.entry[0].changes[0].value;
  const commentId = commentData.id;
  const commentText = commentData.text;
  
  try {
    // コメント受信ログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `コメント受信詳細:
        ID: ${commentId}
        Text: ${commentText}
        Raw Data: ${JSON.stringify(commentData)}`
      }
    });

    // 登録済みの返信を検索
    const replies = await prisma.reply.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 検索結果を詳細にログ出力
    await prisma.executionLog.create({
      data: {
        errorMessage: `SQL実行結果:
        Query: ${JSON.stringify(prisma.reply.findMany.toString())}
        Parameters: replyType=1
        返信検索件数: ${replies.length}
        返信データ: ${JSON.stringify(replies, null, 2)}
        ----
        コメントテキスト: ${commentText}
        `
      }
    });

    // コメントに一致する返信を探す
    for (const reply of replies) {
      const isMatch = reply.matchType === 1 
        ? commentText === reply.keyword
        : commentText.includes(reply.keyword);

      // マッチング結果ログ
      await prisma.executionLog.create({
        data: {
          errorMessage: `マッチング試行:
          コメント: ${commentText}
          キーワード: ${reply.keyword}
          マッチタイプ: ${reply.matchType === 1 ? '完全一致' : '部分一致'}
          結果: ${isMatch ? '一致' : '不一致'}`
        }
      });

      if (isMatch) {
        const account = await prisma.account.findFirst({
          where: {
            provider: 'facebook',
          },
          select: {
            access_token: true,
          },
        });

        // アカウント検索結果ログ
        await prisma.executionLog.create({
          data: {
            errorMessage: `アカウント検索結果:
            アカウント存在: ${account ? 'あり' : 'なし'}
            トークン: ${account?.access_token ? '取得済み' : 'なし'}`
          }
        });

        if (!account?.access_token) {
          throw new Error('アクセストークンが見つかりません');
        }

        // ボタンがある場合は含めて返信を送信
        const buttons = [
          {
            title: 'ボタン1',
            url: 'https://example.com'
          }
        ];
        // const buttons = reply.buttons ? reply.buttons.map(button => ({
        //   title: button.title,
        //   url: button.url
        // })) : [];

        // 送信内容ログ
        await prisma.executionLog.create({
          data: {
            errorMessage: `返信送信内容:
            CommentID: ${commentId}
            Reply: ${reply.reply}
            Buttons: ${JSON.stringify(buttons, null, 2)}`
          }
        });

        await sendInstagramReply(
          commentId,
          reply.reply,
          account.access_token,
          buttons
        );

        await prisma.executionLog.create({
          data: {
            errorMessage: `自動返信送信成功: CommentID=${commentId}, Reply=${reply.reply}, Buttons=${JSON.stringify(buttons)}`
          }
        });

        break;
      }
    }
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `自動返信処理エラー詳細:
        Error: ${error instanceof Error ? error.message : String(error)}
        Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`
      }
    });
    throw error;
  }
}