import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../[...nextauth]/options';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')
  const errorDescription = searchParams.get('error_description')

  // デバッグログ: 環境変数とリダイレクトURI
  const redirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/instagram-callback`;

  // エラーパラメータがある場合はエラーを返す
  if (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram認証エラー: ${error}, ${errorReason}, ${errorDescription}`
      }
    });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=instagram_auth_failed&message=${encodeURIComponent(errorDescription || '認証に失敗しました')}`)
  }

  if (!code) {
    await prisma.executionLog.create({
      data: {
        errorMessage: 'Instagram認証エラー: 認証コードなし'
      }
    });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=no_code&message=${encodeURIComponent('認証コードが提供されていません')}`)
  }

  try {
    // 認証コードをアクセストークンに交換
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    const tokenParams = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      body: tokenParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const tokenData = await tokenResponse.json()
    
    // トークン取得エラーチェック
    if (!tokenResponse.ok || tokenData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramトークン取得エラー: ${JSON.stringify(tokenData)}`
        }
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=token_error&message=${encodeURIComponent(tokenData.error_message || 'トークンの取得に失敗しました')}`)
    }

    if (!tokenData.access_token) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramトークン取得エラー: アクセストークンが存在しません - ${JSON.stringify(tokenData)}`
        }
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=token_error&message=${encodeURIComponent('アクセストークンの取得に失敗しました')}`)
    }

    // 長期アクセストークンを取得
    const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${encodeURIComponent(tokenData.access_token)}`;

    const longLivedTokenResponse = await fetch(longLivedTokenUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const longLivedTokenData = await longLivedTokenResponse.json()
    
    // 長期トークン取得エラーチェック
    if (longLivedTokenData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagram長期トークン取得エラー: ${JSON.stringify(longLivedTokenData)}`
        }
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=long_token_error&message=${encodeURIComponent(longLivedTokenData.error_message || '長期トークンの取得に失敗しました')}`)
    }

    // ユーザー情報を取得
    const userUrl = `https://graph.instagram.com/me?fields=id,user_id,username,account_type,profile_picture_url&access_token=${longLivedTokenData.access_token}`;

    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();
    
    // ユーザー情報取得エラーチェック
    if (userData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramユーザー情報取得エラー: ${JSON.stringify(userData)}`
        }
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=user_info_error&message=${encodeURIComponent(userData.error_message || 'ユーザー情報の取得に失敗しました')}`)
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram認証エラー: 未認証 - ユーザーセッションが見つかりません'
        }
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=unauthorized&message=${encodeURIComponent('認証が必要です')}`)
    }

    // アカウント情報をDBに保存/更新
    await prisma.iGAccount.upsert({
      where: {
        id: userData.id
      },
      create: {
        userId: session.user.id,
        instagramId: userData.id,
        webhookId: userData.user_id,
        id: userData.id,
        username: userData.username,
        profilePictureUrl: userData.profile_picture_url || null,
        accessToken: longLivedTokenData.access_token,
        expiresAt: longLivedTokenData.expires_in ? Math.floor(Date.now() / 1000) + parseInt(longLivedTokenData.expires_in) : null
      },
      update: {
        accessToken: longLivedTokenData.access_token,
        profilePictureUrl: userData.profile_picture_url || null,
        expiresAt: longLivedTokenData.expires_in ? Math.floor(Date.now() / 1000) + parseInt(longLivedTokenData.expires_in) : null,
        updatedAt: new Date(),
        webhookId: userData.user_id 
      }
    });

    const instagramSessionData = {
      id: userData.id,
      username: userData.username,
      profile_picture_url: userData.profile_picture_url || undefined
    };
    
    // セッションを更新するためのレスポンスを作成
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?success=true&message=${encodeURIComponent('Instagramアカウントの連携が完了しました')}&instagram=${encodeURIComponent(JSON.stringify(instagramSessionData))}`
    );

    return response;

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram認証エラー: 予期せぬエラー - ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/connect?error=unknown&message=${encodeURIComponent('予期せぬエラーが発生しました')}`)
  }
} 