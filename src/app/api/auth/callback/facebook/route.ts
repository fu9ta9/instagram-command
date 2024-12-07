import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// 動的ルートとして明示的に設定
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    // ヘッダー情報を安全に取得
    const headersList = headers();
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // リクエスト情報をログに記録
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback受信:
        Full URL: ${url.toString()}
        Search Params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}
        Headers: ${JSON.stringify(Object.fromEntries(headersList.entries()))}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    // NextAuthのコールバックURLにリダイレクト
    const nextAuthCallbackUrl = new URL('/api/auth/callback/facebook', process.env.NEXTAUTH_URL!);
    nextAuthCallbackUrl.search = url.search;

    await prisma.executionLog.create({
      data: {
        errorMessage: `NextAuth Callback リダイレクト:
        URL: ${nextAuthCallbackUrl.toString()}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    return NextResponse.redirect(nextAuthCallbackUrl.toString());

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback エラー:
        Error: ${error instanceof Error ? error.message : String(error)}
        Stack: ${error instanceof Error ? error.stack : ''}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    return NextResponse.json(
      { error: 'Callback error' },
      { status: 500 }
    );
  }
} 