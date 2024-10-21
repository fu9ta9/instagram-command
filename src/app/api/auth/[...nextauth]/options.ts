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
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'public_profile'
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture.data.url,
          facebookAccessToken: profile.accessToken,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // ユーザーの会員種別を取得
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

        // Facebook連携情報を追加
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
      if (account && user) {
        token.id = user.id;
        if (account.provider === 'facebook') {
          token.facebookAccessToken = account.access_token;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/dashboard',
  },
  debug: true,
}
