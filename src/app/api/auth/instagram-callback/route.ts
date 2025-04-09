import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../[...nextauth]/options';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  try {
    // 認証コードをアクセストークンに交換
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/instagram-callback`,
        code: code
      })
    })

    const tokenData = await tokenResponse.json()

    // 長期アクセストークンを取得
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&` +
      `client_secret=${process.env.INSTAGRAM_APP_SECRET}&` +
      `access_token=${tokenData.access_token}`
    )

    const longLivedTokenData = await longLivedTokenResponse.json()

    // ユーザー情報を取得
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${longLivedTokenData.access_token}`
    );
    const userData = await userResponse.json();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        accessToken: longLivedTokenData.access_token,
        expiresAt: longLivedTokenData.expires_in ? Math.floor(Date.now() / 1000) + parseInt(longLivedTokenData.expires_in) : null
      },
      update: {
        accessToken: longLivedTokenData.access_token,
        expiresAt: longLivedTokenData.expires_in ? Math.floor(Date.now() / 1000) + parseInt(longLivedTokenData.expires_in) : null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(longLivedTokenData)
  } catch (error) {
    console.error('Instagram認証エラー:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
} 