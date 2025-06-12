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
      return new Response(challenge, { status: 200 });
    }

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

    // エコーメッセージのチェック
    if (isEchoMessage(webhookData)) {
      return NextResponse.json({ message: 'Echo message ignored' }, { status: 200 });
    }

    // DMメッセージかコメントかを判定
    if (isDMMessage(webhookData)) {
      // DMメッセージの処理
      const reply = await findMatchingReplyForDM(webhookData);
      if (!reply) {
        return NextResponse.json({ message: 'No matching reply found for DM' }, { status: 200 });
      }
      
      // DM返信を送信
      await sendReplyToDM(webhookData, reply);
      
      return NextResponse.json({ message: 'DM reply sent successfully' }, { status: 200 });
    } else if (isCommentMessage(webhookData)) {
      // コメントの処理（既存のロジック）
      const reply = await findMatchingReply(webhookData);
      if (!reply) {
        return NextResponse.json({ message: 'No matching reply found' }, { status: 200 });
      }

      // 返信を送信
      await sendReplyToComment(webhookData, reply);

      return NextResponse.json({ message: 'Comment reply sent successfully' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Unknown webhook type' }, { status: 200 });
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Webhook処理エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function isEchoMessage(webhookData: any): boolean {
  return webhookData.entry?.[0]?.messaging?.[0]?.message?.is_echo === true;
}

// DMメッセージかどうかを判定
function isDMMessage(webhookData: any): boolean {
  return webhookData.entry?.[0]?.messaging?.[0]?.message?.text !== undefined;
}

// コメントメッセージかどうかを判定
function isCommentMessage(webhookData: any): boolean {
  return webhookData.entry?.[0]?.changes?.[0]?.value?.text !== undefined;
}

// DMメッセージ用の返信検索
async function findMatchingReplyForDM(webhookData: any) {
  const messageData = webhookData.entry[0].messaging[0].message;
  const messageText = messageData.text;
  const recipientId = webhookData.entry[0].messaging[0].recipient.id;

  try {
    // ストーリー用の返信を検索（replyType: 2 = STORY）
    const replies = await prisma.reply.findMany({
      where: {
        replyType: 2 // ストーリー用返信をDMに使用
      },
      include: {
        buttons: true,
        igAccount: {
          select: {
            instagramId: true,
            accessToken: true
          }
        }
      }
    });

    // キーワードマッチングを実行
    for (const reply of replies) {
      // アカウントIDが一致するかチェック
      // if (reply.igAccount?.instagramId !== recipientId) {
      //   continue;
      // }

      // キーワードマッチング
      if (reply.matchType === 1 && reply.keyword === messageText) {
        return reply; // 完全一致
      }
      if (reply.matchType === 2 && messageText.includes(reply.keyword)) {
        return reply; // 部分一致
      }
    }

    await prisma.executionLog.create({
      data: { errorMessage: 'DM用マッチする返信が見つかりませんでした' }
    });
    return null;
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `DM返信検索エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    throw error;
  }
}

// DM返信送信関数
async function sendReplyToDM(
  webhookData: any,
  reply: {
    reply: string;
    buttons?: any[];
    igAccount?: IGAccount;
  }
) {
  const senderId = webhookData.entry[0].messaging[0].sender.id;

  try {
    // igAccountの存在確認と型ガード
    if (!reply.igAccount?.instagramId || !reply.igAccount?.accessToken) {
      throw new Error('Instagram アカウント情報が不足しています');
    }

    // igAccountのデータを使用
    const instagramId = reply.igAccount.instagramId;
    const accessToken = reply.igAccount.accessToken;

    // メッセージデータを作成
    const messageData = createMessageData(senderId, reply.reply, reply.buttons || []);

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DM返信送信に失敗: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `DM返信送信エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    throw error;
  }
}

async function findMatchingReply(webhookData: any) {
  const commentData = webhookData.entry[0].changes[0].value
  const commentText = commentData.text
  const mediaId = commentData.media.id

  try {
    // SPECIFIC_POST優先、なければALL_POSTS
    const reply = await prisma.reply.findFirst({
      where: {
        OR: [
          { replyType: 1, postId: mediaId }, // 投稿指定
          { replyType: 2 }                   // 全投稿共通
        ]
      },
      include: {
        buttons: true,
        igAccount: {
          select: {
            instagramId: true,
            accessToken: true
          }
        }
      },
      orderBy: { replyType: 'asc' } // SPECIFIC_POST優先
    })

    if (!reply) {
      return null
    }

    // JSで判定
    if (reply.matchType === 1 && reply.keyword === commentText) {
      return reply // 完全一致
    }
    if (reply.matchType === 2 && commentText.includes(reply.keyword)) {
      return reply // 部分一致
    }

    return null
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

interface IGAccount {
  instagramId: string;
  accessToken: string;
}

async function sendReplyToComment(
  webhookData: any,
  reply: {
    reply: string;
    buttons?: any[];
    igAccount?: IGAccount;
  }
) {
  const commentData = webhookData.entry[0].changes[0].value
  const commenterId = commentData.from.id

  try {
    // igAccountの存在確認と型ガード
    if (!reply.igAccount?.instagramId || !reply.igAccount?.accessToken) {
      throw new Error('Instagram アカウント情報が不足しています')
    }

    // igAccountのデータを使用
    const instagramId = reply.igAccount.instagramId
    const accessToken = reply.igAccount.accessToken

    // メッセージデータを作成
    const messageData = createMessageData(commenterId, reply.reply, reply.buttons || [])

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}/messages?access_token=${accessToken}`,
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
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `返信送信エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    throw error
  }
}