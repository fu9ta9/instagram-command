import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionWrapper } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSessionWrapper();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // セッションのユーザーIDと要求されたユーザーIDが一致することを確認
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const account = await prisma.iGAccount.findFirst({
      where: { userId },
      select: {
        id: true,
        username: true,
        profilePictureUrl: true
      }
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching Instagram account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram account' },
      { status: 500 }
    );
  }
} 