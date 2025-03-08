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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      membershipType: user.membershipType,
      trialStartDate: user.trialStartDate,
      stripeSubscriptionId: user.subscription?.stripeSubscriptionId || null,
      stripeCurrentPeriodEnd: user.subscription?.stripeCurrentPeriodEnd || null,
      status: user.subscription?.status || null
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
} 