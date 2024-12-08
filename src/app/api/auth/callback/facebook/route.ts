import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/options';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
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
        Session User: ${JSON.stringify(session?.user)}
        Access Token: ${accessToken ? `${accessToken.substring(0, 10)}...` : 'なし'}
        Expires In: ${expiresIn}
        Data Access Expiration: ${dataAccessExpirationTime}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    if (!session?.user?.id) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'ユーザーIDが見つかりません'
        }
      });
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!));
    }

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
            userId: session.user.id, // セッションからユーザーIDを取得
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
            UserID: ${session.user.id}
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

    // 正しい環境変数の使用
    const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'https://insta-command.com';
    await prisma.executionLog.create({
      data: {
        errorMessage: `リダイレクト:
        Base URL: ${baseUrl}
        Environment: ${process.env.NODE_ENV}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    // 文字列連結で安全にURLを構築
    return NextResponse.redirect(`${baseUrl}/dashboard`);

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback エラー:
        Error: ${error instanceof Error ? error.message : String(error)}
        Stack: ${error instanceof Error ? error.stack : ''}
        Timestamp: ${new Date().toISOString()}`
      }
    });

    // エラー時は安全なURLにリダイレクト
    const baseUrl = process.env.NEXTAUTH_URL || 'https://insta-command.com';
    return NextResponse.redirect(`${baseUrl}/error`);
  }
} 