import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { getSessionWrapper } from '@/lib/session';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getSessionWrapper();
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const expiresIn = searchParams.get('expires_in');

    if (!session?.user?.id || !accessToken) {
      throw new Error('認証情報が不足しています');
    }

    // Instagram Business Accountの情報を取得
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?fields=instagram_business_account,name,access_token&access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();
    
    const page = pagesData.data?.[0];
    if (!page?.instagram_business_account?.id) {
      throw new Error('Instagram business accountが見つかりません');
    }

    // Instagramアカウントの詳細情報を取得
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v22.0/${page.instagram_business_account.id}?fields=id,username,profile_picture_url&access_token=${accessToken}`
    );
    const instagramData = await instagramResponse.json();

    // アカウント情報をDBに保存/更新
    await prisma.iGAccount.upsert({
      where: {
        id: page.instagram_business_account.id
      },
      create: {
        userId: session.user.id,
        instagramId: page.instagram_business_account.id,
        id: page.instagram_business_account.id,
        username: instagramData.username,
        profilePictureUrl: instagramData.profile_picture_url,
        accessToken: accessToken,
        expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + parseInt(expiresIn) : null
      },
      update: {
        accessToken: accessToken,
        expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + parseInt(expiresIn) : null,
        updatedAt: new Date()
      }
    });

     // Webhookサブスクリプションを設定
     const instagramBusinessId = page.instagram_business_account.id;
     try {
       const subscriptionResponse = await fetch(
         `https://graph.facebook.com/v21.0/${instagramBusinessId}/subscribed_apps`,
         {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             subscribed_fields: 'comments,mentions',  // feedは不要
             access_token: page.access_token
           })
         }
       );
     } catch (error) {
       await prisma.executionLog.create({
         data: {
           errorMessage: `Webhookサブスクリプションエラー:
           Error: ${error instanceof Error ? error.message : String(error)}
           Instagram Business ID: ${instagramBusinessId}
           Timestamp: ${new Date().toISOString()}`
         }
       });
     }

    return NextResponse.redirect(new URL('/connect', request.url));
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram連携エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.redirect(new URL('/error', request.url));
  }
} 