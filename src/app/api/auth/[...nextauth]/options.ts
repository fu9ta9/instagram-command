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
            'pages_show_list'
          ].join(',')
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Session Callback: ${JSON.stringify({ session, user })}`
        }
      });
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `SignIn開始: ${JSON.stringify({ user, account, profile })}`
        }
      });

      if (!account || !user) {
        await prisma.executionLog.create({
          data: {
            errorMessage: 'SignInエラー: アカウントまたはユーザーなし'
          }
        });
        return false;
      }

      try {
        if (account.provider === 'facebook') {
          await prisma.executionLog.create({
            data: {
              errorMessage: `Facebookアカウント保存成功: UserID=${user.id}`
            }
          });
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
    },
    async redirect({ url, baseUrl }) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `リダイレクト: URL=${url}, BaseURL=${baseUrl}`
        }
      });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  events: {
    async signIn(message) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `SignIn Event: ${JSON.stringify(message)}`
        }
      });
    },
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  debug: true,
}
