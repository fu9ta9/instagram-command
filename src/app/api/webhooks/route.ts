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
    await logWebhookReceived(webhookData);

    // エコーメッセージのチェック
    if (isEchoMessage(webhookData)) {
      return NextResponse.json({ message: 'Echo message ignored' }, { status: 200 });
    }

    if (!webhookData.entry?.[0]?.changes?.[0]?.value) {
      throw new Error('Invalid webhook data format');
    }

    // コメントに対する返信を検索
    const reply = await findMatchingReply(webhookData);
    if (!reply) {
      return NextResponse.json({ message: 'No matching reply found' }, { status: 200 });
    }

    // 返信を送信
    await sendReplyToComment(webhookData, reply);

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

// ヘルパー関数
async function logWebhookReceived(webhookData: any) {
  await prisma.executionLog.create({
    data: {
      errorMessage: `Webhookコメント受信: ${JSON.stringify(webhookData)}`
    }
  });
}

function isEchoMessage(webhookData: any): boolean {
  if (webhookData.entry?.[0]?.messaging?.[0]?.message?.is_echo) {
    prisma.executionLog.create({
      data: {
        errorMessage: 'エコーメッセージを検出したため処理を終了します'
      }
    });
    return true;
  }
  return false;
}

async function findMatchingReply(webhookData: any) {
  const commentData = webhookData.entry[0].changes[0].value
  const commentText = commentData.text
  const mediaId = commentData.media.id

  try {
    // 返信を検索
    const replies = await prisma.reply.findMany({
      where: {
        AND: [
          // 投稿タイプによる条件
          {
            OR: [
              { replyType: 2 }, // ALL_POSTS
              { AND: [{ replyType: 1 }, { postId: mediaId }] } // SPECIFIC_POST
            ]
          },
          // キーワードの一致条件
          {
            OR: [
              { AND: [{ matchType: 1 }, { keyword: commentText }] }, // 完全一致
              { AND: [{ matchType: 2 }, { keyword: { in: commentText.split(' ') } }] } // 部分一致
            ]
          }
        ]
      },
      include: {
        buttons: true,
        igAccount: {
          select: {
            accessToken: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    if (replies.length === 0) {
      await prisma.executionLog.create({
        data: { errorMessage: 'マッチする返信が見つかりませんでした' }
      })
      return null
    }

    return replies[0]
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `返信検索エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    throw error
  }
}

// メッセージデータを作成する関数
function createMessageData(commenterId: string, replyText: string, buttons: Array<{ title: string, url: string }>) {
  // ボタンがある場合とない場合で分岐
  if (buttons && buttons.length > 0) {
    // URLが有効なフォーマットかチェックする関数
    const isValidUrl = (urlString: string) => {
      try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // ボタンのURLを検証し、無効なURLを除外
    const validButtons = buttons
      .filter(button => isValidUrl(button.url))
      .map(button => ({
        type: "web_url",
        url: button.url,
        title: button.title.substring(0, 20) // タイトルは20文字までに制限
      }));

    // 有効なボタンがない場合はテキストメッセージのみ送信
    if (validButtons.length === 0) {
      return {
        recipient: {
          id: commenterId
        },
        message: {
          text: replyText
        }
      };
    }

    return {
      recipient: {
        id: commenterId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: replyText.substring(0, 640), // テキストは640文字までに制限
            buttons: validButtons
          }
        }
      }
    };
  } else {
    return {
      recipient: {
        id: commenterId
      },
      message: {
        text: replyText
      }
    };
  }
}

async function sendReplyToComment(webhookData: any, reply: any) {
  const commentData = webhookData.entry[0].changes[0].value
  const commenterId = commentData.from.id
  const mediaId = commentData.media.id

  try {
    if (!reply.igAccount?.accessToken) {
      throw new Error('アクセストークンが見つかりません')
    }

    // Facebook Graph APIからページ情報を取得
    const pageResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?fields=id,access_token&access_token=${reply.igAccount.accessToken}`
    )

    if (!pageResponse.ok) {
      throw new Error('ページ情報取得に失敗しました')
    }

    const pageData = await pageResponse.json()
    
    if (!pageData.data?.[0]?.id || !pageData.data?.[0]?.access_token) {
      throw new Error('ページ情報が見つかりません')
    }

    // const pageId = pageData.data[0].id
    const pageId = "17841447969868460"
    // const pageAccessToken = pageData.data[0].access_token
    const pageAccessToken = "IGQWRQZAkk4LTI4Vl9IRENwdlhwUGxaRlNnei1EUG4zR2xXWS1yaVVya0dTWnp5VmhLQnpoT1BjUVVMcFlKclBqcUNRZATZAhSDhSXzFYN1hmS3ZA3UjBsQkhwdWQxM3U2RVdJdDNjVjJpNEkzT1ozLVRLU045QmJJMTQZD"

    // メッセージデータを作成
    const messageData = createMessageData(commenterId, reply.reply, reply.buttons || [])

    // デバッグ用にメッセージデータをログに記録
    await prisma.executionLog.create({
      data: {
        errorMessage: `送信するメッセージデータ: ${JSON.stringify(messageData)}`
      }
    });

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${pageId}/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`返信送信に失敗: ${JSON.stringify(errorData)}`)
    }

    await prisma.executionLog.create({
      data: {
        errorMessage: `自動返信送信成功: CommentID=${commenterId}, Reply=${reply.reply}`
      }
    })
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `返信送信エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    throw error
  }
}