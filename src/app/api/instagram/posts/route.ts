import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { getInstagramPosts } from '@/lib/instagram';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const postsData = await getInstagramPosts(session.user.id);
    
    await prisma.executionLog.create({
      data: {
        errorMessage: 'Instagram投稿データ取得成功'
      }
    });

    return NextResponse.json(postsData.data);
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Error: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
