import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret:process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          display: "page",
          extras: JSON.stringify({
            setup: {
              channel: "Instagram_Onboarding"
            }
          }),
          redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`,
          response_type: "token",
          scope: [
            'instagram_basic',
            'instagram_manage_comments',
            'pages_show_list',
            'pages_read_engagement'
          ].join(',')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async signIn({ user, account, profile }) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `SignIn開始:
          User: ${JSON.stringify(user)}
          Account: ${JSON.stringify(account)}
          Profile: ${JSON.stringify(profile)}`
        }
      });

      if (!account || !user) {
        await prisma.executionLog.create({
          data: {
            errorMessage: 'SignInエラー: アカウントまたはユーザー情報なし'
          }
        });
        return false;
      }

      try {
        // アカウント情報をDBに保存/更新
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          create: {
            userId: user.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            expires_at: account.expires_at,
            scope: account.scope,
          },
          update: {
            access_token: account.access_token,
            token_type: account.token_type,
            expires_at: account.expires_at,
            scope: account.scope,
          }
        });

        // アクセストークンを使用してFacebookページ情報を取得
        if (account.access_token) {
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v11.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,name,username}&access_token=${account.access_token}`
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
              await prisma.account.update({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId
                  }
                },
                data: {
                  access_token: page.access_token,
                  providerAccountId: page.instagram_business_account.id,
                  scope: account.scope
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
        }

        return true;
      } catch (error) {
        await prisma.executionLog.create({
          data: {
            errorMessage: `アカウント保存エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        });
        return false;
      }
    }
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  debug: true,
}
