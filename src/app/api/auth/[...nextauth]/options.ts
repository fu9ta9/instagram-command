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
            // 'pages_show_list',
            // 'business_management',
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
        return false; // account が null の場合はサインインを拒否
      }
      if (account.provider === 'google') {
        // Google ログイン時の処理
        await prisma.executionLog.create({
          data: {
            errorMessage: `Google サインイン: ${JSON.stringify(user)}`
          }
        });
      } else if (account.provider === 'facebook') {
        // Facebook ログイン時の処理
        await prisma.executionLog.create({
          data: {
            errorMessage: `Facebook サインイン: ${JSON.stringify(user)}`
          }
        });
      }
      return true; // サインインを許可
    },
  },
  pages: {
    signIn: '/dashboard',
  },
}
