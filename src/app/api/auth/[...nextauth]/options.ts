import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Adapter } from "next-auth/adapters"
import { MembershipType } from "@prisma/client"

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
            'public_profile',
          ].join(',')
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async session({ session, token, user }) {
      console.log('Sessionコールバック1 - セッションユーザーID:', session.user.id); // セッションユーザーIDをログに出力
      if (session.user) {
        session.user.id = user.id;
        console.log('Sessionコールバック2 - セッションユーザーID:', session.user.id); // セッションユーザーIDをログに出力

        // Google会員の情報を取得
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { membershipType: true, trialStartDate: true }
        });

        if (dbUser) {
          let effectiveMembershipType = dbUser.membershipType;

          // トライアル期間のチェック
          if (dbUser.membershipType === MembershipType.TRIAL && dbUser.trialStartDate) {
            const trialEndDate = new Date(dbUser.trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14日後
            if (new Date() > trialEndDate) {
              effectiveMembershipType = MembershipType.FREE;
              // トライアル期間が終了した場合、ユーザーの会員種別を更新
              await prisma.user.update({
                where: { id: user.id },
                data: { membershipType: MembershipType.FREE }
              });
            }
          }

          session.user.membershipType = effectiveMembershipType;
        }

        // Facebook連携情報を追加（必要に応じて）
        const facebookAccount = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'facebook' },
        });
        if (facebookAccount) {
          session.user.facebookAccessToken = facebookAccount.access_token || undefined; // nullの場合はundefinedを設定
        }
      }
      return session;
    },
    async jwt({ token, account, user }) {
      console.log('JWTコールバック1 - トークン:', token); // トークンをログに出力
      if (account && user) {
        token.userId = user.id;
        if (account.provider === 'facebook') {
          token.facebookAccessToken = account.access_token;
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log('SignInコールバック1 - ユーザー:', user); // ユーザーをログに出力
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
  },
  debug: true,
}
