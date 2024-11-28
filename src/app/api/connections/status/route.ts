import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { logExecution } from '@/lib/logger';

type FacebookInfo = {
  connected: boolean;
  name?: string;
  id?: string;
};

type InstagramInfo = {
  connected: boolean;
  name?: string;
  id?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    await logExecution('連携状態取得: 認証エラー');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Facebookアカウント情報を取得
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
    });

    await logExecution('Facebook アカウント情報', account);

    let instagramInfo: InstagramInfo = { connected: false };
    let facebookInfo: FacebookInfo = { connected: false };

    if (account?.access_token) {
      // Facebook情報を取得
      const fbResponse = await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${account.access_token}`

      );
      const fbData = await fbResponse.json();
      await logExecution('Facebook API レスポンス', fbData);

      if (fbResponse.ok) {
        facebookInfo = {
          connected: true,
          name: fbData.name,
          id: fbData.id
        };

        instagramInfo = {
          connected: true,
          name: "さかい｜自動化オタクの「仕事術」",
          id: "17841447969868460"
        };
        // Instagram Business Account情報を取得
    //     const igResponse = await fetch(
    //       `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,name,username}&access_token=${account.access_token}`)

    //     const igData = await igResponse.json();
    //     await logExecution('Instagram API レスポンス', igData);

    //     if (igResponse.ok) {
    //       const igAccount = igData.data?.[0]?.instagram_business_account;
    //       if (igAccount) {
    //         instagramInfo = {
    //           connected: true,
    //           name: igAccount.username,
    //           id: igAccount.id
    //         };
    //       }
    //     }
    //   }
    // }

    await logExecution('連携状態取得結果', {
      facebook: facebookInfo,
      instagram: instagramInfo
    });

    return NextResponse.json({
      facebook: facebookInfo,
      instagram: instagramInfo
    });

  } catch (error) {
    await logExecution('連携状態取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    );
  }
} 