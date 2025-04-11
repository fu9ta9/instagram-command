import { NextResponse } from 'next/server';

// 動的ルートとしてマーク
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const limit = searchParams.get('limit') || '30';
    const after = searchParams.get('after') || null;

    if (!accountId) {
      return NextResponse.json({ error: 'アカウントIDが必要です' }, { status: 400 });
    }

    // 環境変数からアクセストークンを取得
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !igUserId) {
      return NextResponse.json({ error: 'Instagram APIの設定が不足しています' }, { status: 500 });
    }

    // Instagram Business Discovery APIを呼び出す
    let apiUrl = `https://graph.facebook.com/v22.0/${igUserId}?fields=business_discovery.username(${accountId}){username,name,profile_picture_url,followers_count,media_count,media{id,comments_count,like_count,media_url,permalink,timestamp,media_type,thumbnail_url}}&access_token=${accessToken}`;
    
    // afterトークンがある場合は追加
    if (after) {
      apiUrl = `https://graph.facebook.com/v22.0/${igUserId}?fields=business_discovery.username(${accountId}){username,name,profile_picture_url,followers_count,media_count,media.after(${after}){id,comments_count,like_count,media_url,permalink,timestamp,media_type,thumbnail_url}}&access_token=${accessToken}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch Instagram posts');
    }
    
    const data = await response.json();
    
    // APIレスポンスから投稿データを抽出
    const businessDiscovery = data.business_discovery;
    const mediaData = businessDiscovery.media;
    const mediaItems = mediaData.data || [];
    const paging = mediaData.paging || null;

    // 投稿データを整形
    const posts = mediaItems.map((item: any) => ({
      id: item.id,
      imageUrl: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
      permalink: item.permalink,
      likes: item.like_count || 0,
      comments: item.comments_count || 0,
      date: item.timestamp,
      type: item.media_type.toLowerCase()
    }));

    // 並べ替え
    let sortedPosts = [...posts];
    switch (sortBy) {
      case 'recent':
        sortedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'likes':
        sortedPosts.sort((a, b) => b.likes - a.likes);
        break;
      case 'comments':
        sortedPosts.sort((a, b) => b.comments - a.comments);
        break;
      default:
        break;
    }

    // 表示件数の制限（「すべて」以外の場合）
    let limitedPosts = sortedPosts;
    if (limit !== '999') {
      limitedPosts = sortedPosts.slice(0, parseInt(limit));
    }

    return NextResponse.json({ 
      posts: limitedPosts,
      meta: {
        followers_count: businessDiscovery.followers_count,
        media_count: businessDiscovery.media_count,
        account_info: {
          name: businessDiscovery.name,
          username: businessDiscovery.username,
          profile_picture_url: businessDiscovery.profile_picture_url
        }
      },
      paging: paging ? {
        cursors: paging.cursors
      } : null
    });
  } catch (error) {
    console.error('Instagram投稿取得エラー:', error);
    
    // エラーメッセージの詳細を取得
    let errorMessage = 'Instagramの投稿の取得に失敗しました。';
    if (error instanceof Error) {
      errorMessage = `${errorMessage} ${error.message}`;
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch Instagram posts',
      message: errorMessage
    }, { status: 500 });
  }
} 