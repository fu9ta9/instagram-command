import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// デバッグログ記録用の関数
async function logDebugInfo(message: string, data?: any) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: `[DEBUG] ${message}${data ? `: ${JSON.stringify(data, null, 2)}` : ''}`
      }
    });
  } catch (error) {
    console.error('ログ記録エラー:', error);
  }
}

// Webhook検証用のGETエンドポイント
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    await logDebugInfo('Webhook検証リクエスト受信', { mode, token, challenge });

    // 検証トークンの確認
    if (mode === 'subscribe' && token === process.env.NEXT_PUBLIC_WEBHOOK_VERIFY_TOKEN) {
      await logDebugInfo('Webhook検証成功');
      return new Response(challenge, { status: 200 });
    }

    await logDebugInfo('Webhook検証失敗', { mode, token });
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
    
    // 受信データ全体をログに記録
    await logDebugInfo('Webhook受信データ', webhookData);

    // エコーメッセージのチェック
    if (isEchoMessage(webhookData)) {
      await logDebugInfo('エコーメッセージを検出、処理をスキップ');
      return NextResponse.json({ message: 'Echo message ignored' }, { status: 200 });
    }

    // メッセージタイプの判定とログ記録
    const isDM = isDMMessage(webhookData);
    const isComment = isCommentMessage(webhookData);
    const isLiveComment = isLiveCommentMessage(webhookData);
    
    await logDebugInfo('メッセージタイプ判定結果', {
      isDM,
      isComment,
      isLiveComment,
      webhookStructure: {
        hasEntry: !!webhookData.entry,
        hasMessaging: !!webhookData.entry?.[0]?.messaging,
        hasChanges: !!webhookData.entry?.[0]?.changes,
        hasField: !!webhookData.field,
        field: webhookData.field
      }
    });

    // メッセージタイプを判定
    if (isDM) {
      await logDebugInfo('DMメッセージ処理開始');
      // DMメッセージの処理
      const reply = await findMatchingReplyForDM(webhookData);
      if (!reply) {
        await logDebugInfo('DM用の返信が見つからなかった');
        return NextResponse.json({ message: 'No matching reply found for DM' }, { status: 200 });
      }
      
      await logDebugInfo('DM用の返信を発見', { replyId: reply.id, replyType: reply.replyType });
      
      // DM返信を送信
      await sendReplyToDM(webhookData, reply);
      
      await logDebugInfo('DM返信送信完了');
      return NextResponse.json({ message: 'DM reply sent successfully' }, { status: 200 });
    } else if (isComment) {
      await logDebugInfo('コメントメッセージ処理開始');
      // コメントの処理（既存のロジック）
      const reply = await findMatchingReply(webhookData);
      if (!reply) {
        await logDebugInfo('コメント用の返信が見つからなかった');
        return NextResponse.json({ message: 'No matching reply found' }, { status: 200 });
      }

      await logDebugInfo('コメント用の返信を発見', { replyId: reply.id, replyType: reply.replyType });

      // 返信を送信
      await sendReplyToComment(webhookData, reply);

      await logDebugInfo('コメント返信送信完了');
      return NextResponse.json({ message: 'Comment reply sent successfully' }, { status: 200 });
    } else if (isLiveComment) {
      await logDebugInfo('LIVEコメントメッセージ処理開始');
      // LIVEコメントの処理
      const reply = await findMatchingReplyForLive(webhookData);
      if (!reply) {
        await logDebugInfo('LIVE用の返信が見つからなかった');
        return NextResponse.json({ message: 'No matching reply found for LIVE' }, { status: 200 });
      }

      await logDebugInfo('LIVE用の返信を発見', { replyId: reply.id, replyType: reply.replyType });

      // LIVE返信を送信
      await sendReplyToLiveComment(webhookData, reply);

      await logDebugInfo('LIVE返信送信完了');
      return NextResponse.json({ message: 'LIVE reply sent successfully' }, { status: 200 });
    }

    await logDebugInfo('未知のWebhookタイプ', {
      webhookData: {
        keys: Object.keys(webhookData),
        entry: webhookData.entry,
        field: webhookData.field
      }
    });
    return NextResponse.json({ message: 'Unknown webhook type' }, { status: 200 });
  } catch (error) {
    await logDebugInfo('Webhook処理で予期しないエラー', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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

// LIVEコメントメッセージかどうかを判定
function isLiveCommentMessage(webhookData: any): boolean {
  return webhookData.field === 'live_comments' && webhookData.value?.text !== undefined;
}

// DMメッセージ用の返信検索
async function findMatchingReplyForDM(webhookData: any) {
  const messageText = webhookData.entry[0].messaging[0].message.text;
  const recipientId = webhookData.entry[0].messaging[0].recipient.id;

  await logDebugInfo('DM返信検索開始', { messageText, recipientId });

  try {
    // 1つのクエリでwebhookIdからIGAccountとその返信を取得
    const replies = await prisma.reply.findMany({
      where: {
        igAccount: {
          webhookId: recipientId
        },
        OR: [
          { replyType: 2 }, // ALL_POSTS
          { replyType: 3 }  // STORY
        ]
      },
      include: {
        buttons: true,
        igAccount: true
      },
      orderBy: { replyType: 'asc' }
    });

    await logDebugInfo('DM返信検索結果', { 
      found: replies.length,
      replies: replies.map(r => ({
        id: r.id,
        keyword: r.keyword,
        matchType: r.matchType,
        replyType: r.replyType
      }))
    });

    // IGAccountが見つからない場合（repliesが空の場合）
    if (replies.length === 0) {
      await logDebugInfo('DM用のIGAccountまたは返信が見つからない');
      return null;
    }

    // JSでキーワード一致判定
    for (const reply of replies) {
      if (reply.matchType === 1 && reply.keyword === messageText) {
        await logDebugInfo('DM完全一致で返信を発見', { replyId: reply.id });
        return reply; // 完全一致
      }
      if (reply.matchType === 2 && messageText.includes(reply.keyword)) {
        await logDebugInfo('DM部分一致で返信を発見', { replyId: reply.id });
        return reply; // 部分一致
      }
    }

    await logDebugInfo('DM用のキーワード一致する返信が見つからない');
    return null;
  } catch (error) {
    await logDebugInfo('DM返信検索でエラー', { error: error instanceof Error ? error.message : String(error) });
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

  await logDebugInfo('DM返信送信開始', { senderId, replyText: reply.reply });

  try {
    // igAccountの存在確認と型ガード
    if (!reply.igAccount?.instagramId || !reply.igAccount?.accessToken) {
      await logDebugInfo('DM返信送信失敗: IGAccountの情報不足', { 
        hasIgAccount: !!reply.igAccount,
        hasInstagramId: !!reply.igAccount?.instagramId,
        hasAccessToken: !!reply.igAccount?.accessToken
      });
      throw new Error('Instagram アカウント情報が不足しています');
    }

    // igAccountのデータを使用
    const instagramId = reply.igAccount.instagramId;
    const accessToken = reply.igAccount.accessToken;

    // メッセージデータを作成
    const messageData = createMessageData(senderId, reply.reply, reply.buttons || []);
    
    await logDebugInfo('DM返信用メッセージデータ作成完了', { messageData });

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    );

    const responseData = await response.json();
    
    if (!response.ok) {
      await logDebugInfo('DM返信送信API失敗', { 
        status: response.status,
        responseData 
      });
      throw new Error(`DM返信送信に失敗: ${JSON.stringify(responseData)}`);
    }
    
    await logDebugInfo('DM返信送信API成功', { responseData });
  } catch (error) {
    await logDebugInfo('DM返信送信でエラー', { error: error instanceof Error ? error.message : String(error) });
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

  await logDebugInfo('コメント返信検索開始', { commentText, mediaId });

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

    await logDebugInfo('コメント返信検索結果', { 
      found: !!reply,
      reply: reply ? {
        id: reply.id,
        keyword: reply.keyword,
        matchType: reply.matchType,
        replyType: reply.replyType,
        postId: reply.postId
      } : null
    });

    if (!reply) {
      await logDebugInfo('コメント用の返信が見つからない');
      return null
    }

    // JSで判定
    if (reply.matchType === 1 && reply.keyword === commentText) {
      await logDebugInfo('コメント完全一致で返信を発見', { replyId: reply.id });
      return reply // 完全一致
    }
    if (reply.matchType === 2 && commentText.includes(reply.keyword)) {
      await logDebugInfo('コメント部分一致で返信を発見', { replyId: reply.id });
      return reply // 部分一致
    }

    await logDebugInfo('コメント用のキーワード一致する返信が見つからない');
    return null
  } catch (error) {
    await logDebugInfo('コメント返信検索でエラー', { error: error instanceof Error ? error.message : String(error) });
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

    // デバッグログを非同期で記録（関数の実行をブロックしないように）
    logDebugInfo('ボタン付きメッセージデータ作成', {
      originalButtons: buttons,
      validButtons,
      filteredCount: buttons.length - validButtons.length
    }).catch(console.error);

    // 有効なボタンがない場合はテキストメッセージのみ送信
    if (validButtons.length === 0) {
      const messageData = {
        recipient: {
          id: commenterId
        },
        message: {
          text: replyText
        }
      };
      
      logDebugInfo('ボタンが無効だったためテキストメッセージに変更', { messageData }).catch(console.error);
      return messageData;
    }

    const messageData = {
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
    
    logDebugInfo('ボタン付きメッセージデータ作成完了', { messageData }).catch(console.error);
    return messageData;
  } else {
    const messageData = {
      recipient: {
        id: commenterId
      },
      message: {
        text: replyText
      }
    };
    
    logDebugInfo('シンプルテキストメッセージデータ作成完了', { messageData }).catch(console.error);
    return messageData;
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

  await logDebugInfo('コメント返信送信開始', { commenterId, replyText: reply.reply });

  try {
    // igAccountの存在確認と型ガード
    if (!reply.igAccount?.instagramId || !reply.igAccount?.accessToken) {
      await logDebugInfo('コメント返信送信失敗: IGAccountの情報不足', { 
        hasIgAccount: !!reply.igAccount,
        hasInstagramId: !!reply.igAccount?.instagramId,
        hasAccessToken: !!reply.igAccount?.accessToken
      });
      throw new Error('Instagram アカウント情報が不足しています')
    }

    // igAccountのデータを使用
    const instagramId = reply.igAccount.instagramId
    const accessToken = reply.igAccount.accessToken

    // メッセージデータを作成
    const messageData = createMessageData(commenterId, reply.reply, reply.buttons || [])

    await logDebugInfo('コメント返信用メッセージデータ作成完了', { messageData });

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    )

    const responseData = await response.json()
    
    if (!response.ok) {
      await logDebugInfo('コメント返信送信API失敗', { 
        status: response.status,
        responseData 
      });
      throw new Error(`返信送信に失敗: ${JSON.stringify(responseData)}`)
    }
    
    await logDebugInfo('コメント返信送信API成功', { responseData });
  } catch (error) {
    await logDebugInfo('コメント返信送信でエラー', { error: error instanceof Error ? error.message : String(error) });
    await prisma.executionLog.create({
      data: {
        errorMessage: `返信送信エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    throw error
  }
}

// LIVEコメント用の返信検索
async function findMatchingReplyForLive(webhookData: any) {
  const commentText = webhookData.value.text;
  const mediaId = webhookData.value.media?.id;

  await logDebugInfo('LIVE返信検索開始', { commentText, mediaId });

  try {
    // LIVEコメント用の返信を検索
    const replies = await prisma.reply.findMany({
      where: {
        replyType: 3 // LIVE
      },
      include: {
        buttons: true,
        igAccount: true
      }
    });

    await logDebugInfo('LIVE返信検索結果', { 
      found: replies.length,
      replies: replies.map(r => ({
        id: r.id,
        keyword: r.keyword,
        matchType: r.matchType,
        replyType: r.replyType
      }))
    });

    // IGAccountが見つからない場合（repliesが空の場合）
    if (replies.length === 0) {
      await logDebugInfo('LIVE用の返信が見つからない');
      return null;
    }

    // JSでキーワード一致判定
    for (const reply of replies) {
      if (reply.matchType === 1 && reply.keyword === commentText) {
        await logDebugInfo('LIVE完全一致で返信を発見', { replyId: reply.id });
        return reply; // 完全一致
      }
      if (reply.matchType === 2 && commentText.includes(reply.keyword)) {
        await logDebugInfo('LIVE部分一致で返信を発見', { replyId: reply.id });
        return reply; // 部分一致
      }
    }

    await logDebugInfo('LIVE用のキーワード一致する返信が見つからない');
    return null;
  } catch (error) {
    await logDebugInfo('LIVE返信検索でエラー', { error: error instanceof Error ? error.message : String(error) });
    await prisma.executionLog.create({
      data: {
        errorMessage: `LIVE返信検索エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    throw error;
  }
}

// LIVEコメント返信送信関数
async function sendReplyToLiveComment(
  webhookData: any,
  reply: {
    reply: string;
    buttons?: any[];
    igAccount?: IGAccount;
  }
) {
  const commenterId = webhookData.value.from.id;

  await logDebugInfo('LIVE返信送信開始', { commenterId, replyText: reply.reply });

  try {
    // igAccountの存在確認と型ガード
    if (!reply.igAccount?.instagramId || !reply.igAccount?.accessToken) {
      await logDebugInfo('LIVE返信送信失敗: IGAccountの情報不足', { 
        hasIgAccount: !!reply.igAccount,
        hasInstagramId: !!reply.igAccount?.instagramId,
        hasAccessToken: !!reply.igAccount?.accessToken
      });
      throw new Error('Instagram アカウント情報が不足しています');
    }

    // igAccountのデータを使用
    const instagramId = reply.igAccount.instagramId;
    const accessToken = reply.igAccount.accessToken;

    // メッセージデータを作成
    const messageData = createMessageData(commenterId, reply.reply, reply.buttons || []);

    await logDebugInfo('LIVE返信用メッセージデータ作成完了', { messageData });

    // Instagram APIで返信を送信
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    );

    const responseData = await response.json();
    
    if (!response.ok) {
      await logDebugInfo('LIVE返信送信API失敗', { 
        status: response.status,
        responseData 
      });
      throw new Error(`LIVE返信送信に失敗: ${JSON.stringify(responseData)}`);
    }
    
    await logDebugInfo('LIVE返信送信API成功', { responseData });
  } catch (error) {
    await logDebugInfo('LIVE返信送信でエラー', { error: error instanceof Error ? error.message : String(error) });
    await prisma.executionLog.create({
      data: {
        errorMessage: `LIVE返信送信エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    throw error;
  }
}