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
        // Facebookページ情報を取得してInstagram Business Account IDを取得
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,name,username}&access_token=${accessToken}`
        );

        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          await prisma.executionLog.create({
            data: {
              errorMessage: `Facebookページ情報取得成功: ${JSON.stringify(pagesData)}`
            }
          });

          // Instagram Business Account情報があれば保存
          const page = pagesData.data?.[0];
          if (page?.instagram_business_account) {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: 'facebook',
                  providerAccountId: session!.user!.id
                }
              },
              create: {
                userId: session!.user!.id,
                type: 'oauth',
                provider: 'facebook',
                providerAccountId: page.instagram_business_account.id,  // Instagram Business Account ID
                access_token: page.access_token,  // ページのアクセストークン
                scope: 'instagram_basic'
              },
              update: {
                access_token: page.access_token,
                scope: 'instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement'
              }
            });

            await prisma.executionLog.create({
              data: {
                errorMessage: `Instagram Business Account更新:
                ID: ${page.instagram_business_account.id}
                Username: ${page.instagram_business_account.username}
                Access Token: ${page.access_token.substring(0, 10)}...`
              }
            });
          }
        }
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