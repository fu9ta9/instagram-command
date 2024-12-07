import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// 動的ルートとして明示的に設定
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const headersList = headers();
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // クエリパラメータからトークン情報を取得
    const accessToken = searchParams.get('access_token');
    const expiresIn = searchParams.get('expires_in');
    const dataAccessExpirationTime = searchParams.get('data_access_expiration_time');

    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback受信:
        URL: ${url.toString()}
        Search Params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}
        Access Token: ${accessToken ? `${accessToken.substring(0, 10)}...` : 'なし'}
        Expires In: ${expiresIn}
        Data Access Expiration: ${dataAccessExpirationTime}
        Headers: ${JSON.stringify(Object.fromEntries(headersList.entries()))}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    if (accessToken) {
      try {
        // アカウント情報をDBに保存
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'facebook',
              providerAccountId: accessToken // 一時的にアクセストークンをIDとして使用
            }
          },
          create: {
            userId: '1', // 仮のユーザーID
            type: 'oauth',
            provider: 'facebook',
            providerAccountId: accessToken,
            access_token: accessToken,
            expires_at: expiresIn ? parseInt(expiresIn) : undefined,
            scope: 'instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement'
          },
          update: {
            access_token: accessToken,
            expires_at: expiresIn ? parseInt(expiresIn) : undefined
          }
        });

        await prisma.executionLog.create({
          data: {
            errorMessage: `アカウント情報保存成功:
            Provider: facebook
            Access Token: ${accessToken.substring(0, 10)}...
            Expires In: ${expiresIn}
            Timestamp: ${new Date().toISOString()}`
          }
        });

      } catch (error) {
        await prisma.executionLog.create({
          data: {
            errorMessage: `アカウント保存エラー:
            Error: ${error instanceof Error ? error.message : String(error)}
            Stack: ${error instanceof Error ? error.stack : ''}
            Timestamp: ${new Date().toISOString()}`
          }
        });
      }
    }

    // ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_NEXTAUTH_URL!));

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