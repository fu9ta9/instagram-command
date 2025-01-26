import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


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

    if (!webhookData.entry?.[0]?.changes?.[0]?.value) {
      throw new Error('Invalid webhook data format');
    }

    // 非同期処理を同期的に実行
    await processInstagramComment(webhookData);

    return NextResponse.json({ message: 'Success' }, { status: 200 });

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
  const igId = commentData.from.id;
  const commentText = commentData.text;
  
  try {
    // コメント受信ログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `コメント受信詳細:
        ID: ${igId}
        Text: ${commentText}
        Raw Data: ${JSON.stringify(commentData)}`
      }
    });

    // 登録済みの返信を検索
    console.log('Fetching replies...');
    const replies = await prisma.reply.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // まず実行結果の基本情報をログ出力
    await prisma.executionLog.create({
      data: {
        errorMessage: `SQL実行開始:
        時刻: ${new Date().toISOString()}
        環境: ${process.env.NODE_ENV}`
      }
    });

    // 検索結果の詳細をログ出力（分割して記録）
    await prisma.executionLog.create({
      data: {
        errorMessage: `SQL実行基本情報:
        返信検索件数: ${replies.length}
        実行時刻: ${new Date().toISOString()}`
      }
    });

    // データ内容を別ログとして記録
    if (replies.length > 0) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `返信データサンプル:
          First Reply: ${JSON.stringify(replies[0], null, 2)}`
        }
      });
    }

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

        // Facebook Graph APIからページIDを取得
        const pageResponse = await fetch(
          `https://graph.facebook.com/v22.0/me/accounts?fields=id&access_token=${account.access_token}`
        );

        if (!pageResponse.ok) {
          throw new Error('ページID取得に失敗しました');
        }

        const pageData = await pageResponse.json();
        const pageId = pageData.id;
        // ボタンがある場合は含めて返信を送信
        const buttons = [
          {
            title: 'ボタン1',
            url: 'https://example.com'
          }
        ];

        await sendInstagramReply(
          igId,
          reply.reply,
          account.access_token,
          pageId,  // Facebook APIから取得したページID
          buttons
        );

        await prisma.executionLog.create({
          data: {
            errorMessage: `自動返信送信成功: CommentID=${igId}, Reply=${reply.reply}, Buttons=${JSON.stringify(buttons)}`
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

async function sendInstagramReply(
  commentId: string,
  replyText: string,
  accessToken: string,
  pageId: string,
  buttons: Array<{ title: string, url: string }>
) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram API リクエスト構築:
        Version: v22.0
        Endpoint: /${pageId}/messages
        CommentID: ${commentId}`
      }
    });

    const messageData = {
      recipient: {
        id: commentId  // IGSID (Instagram Scoped ID)
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: replyText,
            buttons: buttons.map(button => ({
              type: "web_url",
              url: button.url,
              title: button.title
            }))
          }
        }
      }
    };

    // リクエスト内容のログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `送信リクエスト詳細:
        Payload: ${JSON.stringify(messageData, null, 2)}`
      }
    });

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${pageId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    await prisma.executionLog.create({
      data: {
        errorMessage: `API応答:
        Status: ${response.status}
        Response: ${JSON.stringify(result)}`
      }
    });

    return result;
  } catch (error) {
    throw new Error(`Instagram API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}