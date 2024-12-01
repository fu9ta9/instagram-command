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
          errorMessage: `
SignInコールバック開始:
----------------------------------------
User: ${JSON.stringify(user, null, 2)}
----------------------------------------
Account: ${JSON.stringify(account, null, 2)}
----------------------------------------
Profile: ${JSON.stringify(profile, null, 2)}
----------------------------------------
Timestamp: ${new Date().toISOString()}
`
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

          await prisma.executionLog.create({
            data: {
              errorMessage: `Facebookアカウント保存成功: 
                UserID=${user.id}
                AccountID=${account.providerAccountId}
                Scope=${account.scope}`
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
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  debug: true,
}
