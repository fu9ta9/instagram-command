import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'email',
            'public_profile',
            'instagram_basic',
            'pages_show_list',
            'business_management',
          ].join(',')
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      // 詳細なログ記録
      await prisma.executionLog.create({
        data: {
          errorMessage: `
サインインデータ:
User: ${JSON.stringify(user, null, 2)}
Account: ${JSON.stringify(account, null, 2)}
Profile: ${JSON.stringify(profile, null, 2)}
`
        }
      });

      try {
        if (account.provider === 'facebook') {
          // アクセストークンの検証
          if (account.access_token) {
            // Facebook Graph APIのデバッグエンドポイントを使用してトークン情報を取得
            const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${account.access_token}&access_token=${account.access_token}`;
            const tokenResponse = await fetch(debugTokenUrl);
            const tokenData = await tokenResponse.json();
            
            await prisma.executionLog.create({
              data: {
                errorMessage: `アクセストークン情報: ${JSON.stringify(tokenData, null, 2)}`
              }
            });

            // Instagram Business Account情報の取得を試行
            const igResponse = await fetch(
              `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,name,username}&access_token=${account.access_token}`
            );
            const igData = await igResponse.json();
            
            await prisma.executionLog.create({
              data: {
                errorMessage: `Instagram Business Account情報: ${JSON.stringify(igData, null, 2)}`
              }
            });
          }

          // スコープ情報の確認
          const scopeResponse = await fetch(
            `https://graph.facebook.com/v20.0/me/permissions?access_token=${account.access_token}`
          );
          const scopeData = await scopeResponse.json();
          
          await prisma.executionLog.create({
            data: {
              errorMessage: `付与された権限: ${JSON.stringify(scopeData, null, 2)}`
            }
          });
        }
      } catch (error) {
        await prisma.executionLog.create({
          data: {
            errorMessage: `連携エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        });
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
}
