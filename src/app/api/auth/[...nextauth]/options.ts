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
              channel: "IG_API_ONBOARDING"
            }
          }),
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
      if (account && account.provider === 'facebook') {
        try {
          // upsertを使用して、レコードが存在しない場合は作成、存在する場合は更新
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: 'facebook',
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              scope: account.scope,
              access_token: account.access_token,
            },
            create: {
              userId: user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              scope: account.scope,
            },
          });
        } catch (error) {
          console.error('Error updating account:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  debug: true,
}
