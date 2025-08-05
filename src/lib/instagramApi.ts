import { Post } from '@/types/reply';

interface ButtonParam {
  title: string;
  url: string;
}

interface MessageBody {
  text?: string;
  attachment?: {
    type: "template";
    payload: {
      template_type: "button";
      text: string;
      buttons: Array<{
        type: "web_url";
        url: string;
        title: string;
      }>;
    };
  };
}

export async function sendInstagramReply(
  commentId: string,
  message: string,
  accessToken: string,
  buttons?: ButtonParam[]
) {
  try {
    const messageBody = createMessageBody(message, buttons);
    const url = `https://graph.instagram.com/v20.0/${commentId}/replies`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageBody,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// 投稿メディア情報を取得する関数
async function getPostMediaInfo(postId: string, accessToken: string) {
  try {
    const url = `https://graph.instagram.com/v20.0/${postId}?fields=media_url,thumbnail_url,permalink,media_type,media_product_type&access_token=${accessToken}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch media info for post ${postId}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // フィード/リール判別に基づいて適切な画像URLを選択
    let imageUrl;
    if (data.media_type === 'VIDEO') {
      imageUrl = data.thumbnail_url;
    } else {
      imageUrl = data.media_url;
    }
    
    return {
      imageUrl: imageUrl || data.media_url || data.thumbnail_url,
      permalink: data.permalink,
      mediaType: data.media_type
    };
  } catch (error) {
    return {
      imageUrl: null,
      permalink: `https://instagram.com/p/${postId}/`,
      mediaType: 'IMAGE' // デフォルト値
    };
  }
}

// Post選択Template送信関数
export async function sendPostTemplate(
  instagramId: string,
  recipientId: string,
  posts: Post[],
  accessToken: string
) {
  try {
    // 各投稿のメディア情報を並行取得
    const mediaInfoPromises = posts.map(post => 
      getPostMediaInfo(post.postId, accessToken)
    );
    const mediaInfos = await Promise.all(mediaInfoPromises);

    const elements = posts.map((post, index) => ({
      title: post.title,
      image_url: mediaInfos[index].imageUrl,
      buttons: [
        {
          type: "web_url",
          url: mediaInfos[index].permalink,
          title: mediaInfos[index].mediaType === 'VIDEO' ? "リールを見る" : "投稿を見る"
        }
      ]
    }));

    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements
          }
        }
      }
    };

    const url = `https://graph.instagram.com/v20.0/${instagramId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram Post Template API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

function createMessageBody(message: string, buttons?: ButtonParam[]): MessageBody {
  if (buttons && buttons.length > 0) {
    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: message,
          buttons: buttons.map(button => ({
            type: "web_url",
            url: button.url,
            title: button.title,
          }))
        }
      }
    };
  }
  return { text: message };
} 