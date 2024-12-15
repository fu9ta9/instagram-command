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
          redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/facebook-callback`,
          response_type: "token",
          scope: [
            'instagram_basic',
            // 'instagram_manage_comments',
            // 'pages_show_list',
            // 'pages_read_engagement'
          ].join(',')
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `SignIn開始: ${JSON.stringify({ user, account, profile })}`
        }
      });

      // 既存のセッションをクリア
      await prisma.session.deleteMany({
        where: { userId: user.id }
      });

      // 既存のアカウント登録処理はそのまま維持
      if (account?.provider === 'facebook' && account.access_token) {
        try {
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
        } catch (error) {
          await prisma.executionLog.create({
            data: {
              errorMessage: `アカウント保存エラー: ${error instanceof Error ? error.message : String(error)}`
            }
          });
          return false;
        }
      }

      return true;
    },
    async session({ session, user }) {
      if (session?.user) {
        // 現在のユーザー情報を再取得して検証
        const currentUser = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (!currentUser) {
          throw new Error('User not found');
        }

        // セッション情報を更新
        session.user.id = currentUser.id;
        session.user.email = currentUser.email;
      }

      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24時間
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  events: {
    async signOut({ session, token }) {
      // ログアウト時にセッションを削除
      if (session?.user?.id) {
        await prisma.session.deleteMany({
          where: { userId: session.user.id }
        });
      }
    }
  }
};
