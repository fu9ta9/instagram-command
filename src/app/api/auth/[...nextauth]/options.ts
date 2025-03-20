import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters";
import type { Session } from "next-auth";

// Session型を拡張
interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    instagram?: {
      connected: boolean;
    };
  } & Session['user']
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                membershipType: 'FREE'
              }
            });
          }
        }
        
        return true;
      } catch (error) {
        return false;
      }
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        
        try {
          const igAccount = await prisma.iGAccount.findFirst({
            where: { userId: token.id as string },
            select: { id: true }
          });
          
          session.user.instagram = {
            connected: !!igAccount
          };
        } catch (error) {
          // エラーは無視
        }
      }
      
      return session as CustomSession;
    }
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
}
