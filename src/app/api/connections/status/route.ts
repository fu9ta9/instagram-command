import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

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
    const igAccount = await prisma.iGAccount.findFirst({
      where: {
        userId: session.user.id,
      }
    });

    let instagramInfo: InstagramInfo = { connected: false };

    if (igAccount?.accessToken) {
        instagramInfo = {
          connected: true,
          name: igAccount.username,
          id: igAccount.instagramId ?? undefined,
          profile_picture_url: igAccount.profilePictureUrl ?? undefined 
        };
      }
    return NextResponse.json({
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