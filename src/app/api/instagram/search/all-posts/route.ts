import { NextResponse } from 'next/server';

// 動的ルートとしてマーク
export const dynamic = 'force-dynamic';

// すべての投稿を取得する関数を外部に移動
async function fetchAllPosts(username: string, igUserId: string, accessToken: string) {
  let allPosts: any[] = [];
  let hasMore = true;
  let afterToken = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 5; // 最大試行回数を制限

  // アカウント情報を保持
  let accountInfo = null;
  let followersCount = 0;
  let mediaCount = 0;


  while (hasMore && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // APIエンドポイントを構築
    const apiUrl: string = `https://graph.facebook.com/v22.0/${igUserId}?fields=business_discovery.username(${username}){username,name,profile_picture_url,followers_count,media_count,media${afterToken ? `.after(${afterToken})` : ''}{id,comments_count,like_count,media_url,permalink,timestamp,media_type,thumbnail_url}}&access_token=${accessToken}`;
    
    
    try {
      const response: Response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData: any = await response.json();
        console.error('Instagram API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch Instagram posts');
      }
      
      const data: any = await response.json();
      
      if (!data.business_discovery) {
        console.error('business_discoveryが見つかりません:', data);
        throw new Error('アカウントが見つからないか、アクセスできません');
      }
      
      const businessDiscovery: any = data.business_discovery;
      
      // 初回のみアカウント情報を保存
      if (attempts === 1) {
        accountInfo = {
          name: businessDiscovery.name,
          username: businessDiscovery.username,
          profile_picture_url: businessDiscovery.profile_picture_url
        };
        followersCount = businessDiscovery.followers_count;
        mediaCount = businessDiscovery.media_count;
        
      }
      
      const mediaData = businessDiscovery.media;
      const mediaItems = mediaData.data || [];
      
      
      // 投稿を追加
      allPosts = [...allPosts, ...mediaItems];
      
      // 次のページがあるか確認
      if (mediaData.paging && mediaData.paging.cursors && mediaData.paging.cursors.after) {
        afterToken = mediaData.paging.cursors.after;
      } else {
        hasMore = false;
      }
      
      // APIレート制限を考慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`ページ ${attempts} の取得に失敗:`, error);
      hasMore = false;
    }
  }

  
  return {
    posts: allPosts,
    accountInfo,
    followersCount,
    mediaCount
  };
}

export async function GET(request: Request) {
  try {
    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const sortBy = searchParams.get('sortBy') || 'recent';


    if (!accountId) {
      return NextResponse.json({ error: 'アカウントIDが必要です' }, { status: 400 });
    }

    // 環境変数からアクセストークンを取得
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !igUserId) {
      console.error('環境変数が設定されていません: INSTAGRAM_ACCESS_TOKEN または INSTAGRAM_USER_ID');
      return NextResponse.json({ error: 'Instagram APIの設定が不足しています' }, { status: 500 });
    }

    // すべての投稿を取得
    const result = await fetchAllPosts(accountId, igUserId, accessToken);
    
    if (result.posts.length === 0) {
      // 投稿がない場合でもアカウント情報があれば返す
      if (result.accountInfo) {
        return NextResponse.json({
          posts: [],
          meta: {
            followers_count: result.followersCount,
            media_count: result.mediaCount,
            account_info: result.accountInfo
          }
        });
      }
    }
    
    // 投稿データを整形
    const posts = result.posts.map((item: any) => ({
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


    return NextResponse.json({ 
      posts: sortedPosts,
      meta: {
        followers_count: result.followersCount,
        media_count: result.mediaCount,
        account_info: result.accountInfo
      }
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