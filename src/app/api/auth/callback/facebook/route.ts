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
    const hash = url.hash; // #以降の文字列を取得

    // アクセストークンの取得
    const accessToken = hash.match(/access_token=([^&]*)/)?.[1];
    const expiresIn = hash.match(/expires_in=([^&]*)/)?.[1];
    const dataAccessExpirationTime = hash.match(/data_access_expiration_time=([^&]*)/)?.[1];

    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback受信:
        URL: ${url.toString()}
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