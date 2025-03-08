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
  return {
    recipient: {
      id: commenterId  // IGSID (Instagram Scoped ID)
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

    const pageId = pageData.data[0].id
    const pageAccessToken = pageData.data[0].access_token

    // メッセージデータを作成
    const messageData = createMessageData(commenterId,reply.reply, reply.buttons || [])

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${pageId}/messages?access_token=${pageAccessToken}`,
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