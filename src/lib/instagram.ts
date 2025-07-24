import { prisma } from '@/lib/prisma';
import { IGAccount } from '@prisma/client';

export async function getInstagramAccount(userId: string) {
  const igAccount = await prisma.iGAccount.findFirst({
    where: { userId },
    select: {
      id: true,
      instagramId: true,
      username: true,
      profilePictureUrl: true
    }
  });
  return igAccount;
}

// アクセストークンが必要な場合のみ使用する関数
export async function getInstagramAccessToken(userId: string) {
  const igAccount = await prisma.iGAccount.findFirst({
    where: { userId },
    select: { accessToken: true }
  });
  return igAccount?.accessToken;
}

// Instagram APIを使用する関数
export async function fetchInstagramPosts(igAccount: IGAccount, afterToken?: string | null) {
  try {
    // URLを構築
    let url = `https://graph.instagram.com/v20.0/${igAccount.instagramId}/media?fields=id,comments_count,like_count,media_product_type,media_url,thumbnail_url,timestamp&access_token=${igAccount.accessToken}`;
    
    // afterトークンがある場合は追加
    if (afterToken) {
      url += `&after=${afterToken}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch Instagram posts');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    throw error;
  }
}

// プロフィール画像URLを取得する関数
export async function fetchInstagramProfilePicture(username: string, accessToken: string, igUserId: string) {
  try {
    const apiUrl = `https://graph.instagram.com/v23.0/${igUserId}?fields=profile_picture_url&access_token=${accessToken}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error for profile picture:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch Instagram profile picture');
    }
    
    const data = await response.json();
    return data.profile_picture_url || null;
  } catch (error) {
    console.error('Error fetching Instagram profile picture:', error);
    return null; // エラー時はnullを返す
  }
} 