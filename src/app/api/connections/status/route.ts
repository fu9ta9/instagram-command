import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
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

    let instagramInfo: InstagramInfo = { connected: false };
    let facebookInfo: FacebookInfo = { connected: false };

    if (account?.access_token) {
      // Facebook情報を取得
      const fbResponse = await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${account.access_token}`
      );
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        facebookInfo = {
          connected: true,
          name: fbData.name,
          id: fbData.id
        };

        // Instagram Business Account情報を取得
        const igResponse = await fetch(
          ` https://graph.facebook.com/v20.0/me?fields=instagram_business_account{id,name,username}&access_token=${account.access_token} `
        );
        if (igResponse.ok) {
          const igData = await igResponse.json();
          const igAccount = igData.data?.[0]?.instagram_business_account;
          if (igAccount) {
            instagramInfo = {
              connected: true,
              name: igAccount.username,
              id: igAccount.id
            };
          }
        }
      }
    }

    return NextResponse.json({
      facebook: facebookInfo,
      instagram: instagramInfo
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    );
  }
} 