import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MembershipType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // セッションのユーザーIDとリクエストされたユーザーIDが一致することを確認
  if (session.user.id !== params.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        membershipType: true,
        trialStartDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let effectiveMembershipType = user.membershipType;

    // トライアル期間のチェック
    if (user.membershipType === MembershipType.TRIAL && user.trialStartDate) {
      const trialEndDate = new Date(user.trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14日後
      if (new Date() > trialEndDate) {
        effectiveMembershipType = MembershipType.FREE;
        // トライアル期間が終了した場合、ユーザーの会員種別を更新
        await prisma.user.update({
          where: { id: params.userId },
          data: { membershipType: MembershipType.FREE }
        });
      }
    }

    return NextResponse.json({
      membershipType: effectiveMembershipType,
      trialStartDate: user.trialStartDate,
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership information' },
      { status: 500 }
    );
  }
} 