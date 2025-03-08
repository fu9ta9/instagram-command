import { prisma } from '@/lib/prisma';

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
export async function getInstagramPosts(userId: string) {
  const igAccount = await prisma.iGAccount.findFirst({
    where: { userId },
    select: {
      instagramId: true,
      accessToken: true
    }
  });

  if (!igAccount?.accessToken || !igAccount.instagramId) {
    throw new Error('Instagram account not connected');
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${igAccount.instagramId}/media?fields=id,comments_count,like_count,media_product_type,media_url,thumbnail_url,timestamp&access_token=${igAccount.accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram posts');
  }

  return response.json();
} 