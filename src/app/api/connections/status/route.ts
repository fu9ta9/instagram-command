import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

type FacebookInfo = {
  connected: boolean;
  name?: string;
  id?: string;
};

type InstagramInfo = {
  connected: boolean;
  name?: string;
  id?: string;
  profile_picture_url?: string;
};

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    
    // セッションログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `Connection Status Check:
        Session: ${JSON.stringify(session)}`
      }
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // アカウント情報取得
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook'
      }
    });

    // アカウント情報ログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Account:
        Account: ${JSON.stringify(account)}`
      }
    });

    let instagramInfo: InstagramInfo = { connected: false };
    let facebookInfo: FacebookInfo = { connected: false };

    if (account?.access_token) {
      // Facebook情報を取得
      const fbResponse = await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${account.access_token}`
      );
      
      // Facebookレスポンスログ
      await prisma.executionLog.create({
        data: {
          errorMessage: `Facebook API Response:
          Status: ${fbResponse.status}
          OK: ${fbResponse.ok}`
        }
      });

      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        facebookInfo = {
          connected: true,
          name: fbData.name,
          id: fbData.id
        };

        // Instagram Business Account情報を取得
        const igResponse = await fetch(
          `https://graph.facebook.com/v20.0/${account.providerAccountId}?fields=id,name,username,profile_picture_url&access_token=${account.access_token}`
        );

        // Instagramレスポンスログ
        await prisma.executionLog.create({
          data: {
            errorMessage: `Instagram API Response:
            Status: ${igResponse.status}
            OK: ${igResponse.ok}
            Response: ${JSON.stringify(await igResponse.clone().json())}`
          }
        });

        if (igResponse.ok) {
          const igData = await igResponse.json();
          await prisma.executionLog.create({
            data: {
              errorMessage: `Instagram Data:
              Data: ${JSON.stringify(igData)}`
            }
          });

          if (igData.instagram_business_account) {
            instagramInfo = {
              connected: true,
              name: igData.instagram_business_account.username,
              id: igData.instagram_business_account.id,
              profile_picture_url: igData.instagram_business_account.profile_picture_url
            };
          }
        }
      }
    }

    // 最終結果ログ
    await prisma.executionLog.create({
      data: {
        errorMessage: `Final Status:
        Facebook: ${JSON.stringify(facebookInfo)}
        Instagram: ${JSON.stringify(instagramInfo)}`
      }
    });

    return NextResponse.json({
      facebook: facebookInfo,
      instagram: instagramInfo
    });

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Connection Status Error:
        Error: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 