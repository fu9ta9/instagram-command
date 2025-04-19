import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const { code } = await request.json();
  const redirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/instagram-callback`;

  if (!code) {
    await prisma.executionLog.create({
      data: {
        errorMessage: 'Instagram認証エラー: 認証コードなし'
      }
    });
    return NextResponse.json(
      { error: 'no_code', message: '認証コードが提供されていません' },
      { status: 400 }
    );
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
    });

    const tokenData = await tokenResponse.json();
    
    // トークン取得エラーチェック
    if (!tokenResponse.ok || tokenData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramトークン取得エラー: ${JSON.stringify(tokenData)}`
        }
      });
      return NextResponse.json(
        { error: 'token_error', message: tokenData.error_message || 'トークンの取得に失敗しました' },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramトークン取得エラー: アクセストークンが存在しません - ${JSON.stringify(tokenData)}`
        }
      });
      return NextResponse.json(
        { error: 'token_error', message: 'アクセストークンの取得に失敗しました' },
        { status: 400 }
      );
    }

    // 長期アクセストークンを取得
    const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${encodeURIComponent(tokenData.access_token)}`;

    const longLivedTokenResponse = await fetch(longLivedTokenUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const longLivedTokenData = await longLivedTokenResponse.json();
    
    // 長期トークン取得エラーチェック
    if (longLivedTokenData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagram長期トークン取得エラー: ${JSON.stringify(longLivedTokenData)}`
        }
      });
      return NextResponse.json(
        { error: 'long_token_error', message: longLivedTokenData.error_message || '長期トークンの取得に失敗しました' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得
    const userUrl = `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url&access_token=${longLivedTokenData.access_token}`;

    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();
    
    // ユーザー情報取得エラーチェック
    if (userData.error) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Instagramユーザー情報取得エラー: ${JSON.stringify(userData)}`
        }
      });
      return NextResponse.json(
        { error: 'user_info_error', message: userData.error_message || 'ユーザー情報の取得に失敗しました' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'Instagram認証エラー: 未認証 - ユーザーセッションが見つかりません'
        }
      });
      return NextResponse.json(
        { error: 'unauthorized', message: '認証が必要です' },
        { status: 401 }
      );
    }

    // アカウント情報をDBに保存/更新
    await prisma.iGAccount.upsert({
      where: {
        id: userData.id
      },
      create: {
        userId: session.user.id,
        instagramId: userData.id,
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
        updatedAt: new Date()
      }
    });

    const instagramSessionData = {
      id: userData.id,
      username: userData.username,
      profile_picture_url: userData.profile_picture_url || undefined
    };
    
    return NextResponse.json({
      success: true,
      message: 'Instagramアカウントの連携が完了しました',
      instagram: instagramSessionData
    });

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Instagram認証エラー: 予期せぬエラー - ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json(
      { error: 'unknown', message: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 