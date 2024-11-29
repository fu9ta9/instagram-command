import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters";
import { logExecution } from '@/lib/logger';

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
      await logExecution('Facebook連携開始', {
        user,
        account,
        profile
      });
      if (!account) {
        return false;
      }

      try {
        if (account.provider === 'facebook') {
          // アクセストークンの検証
          if (account.access_token) {
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
