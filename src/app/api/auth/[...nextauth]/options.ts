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
        await prisma.executionLog.create({
          data: {
            errorMessage: `サインイン試行: ${JSON.stringify({ 
              user: user, 
              accountType: account?.provider,
              profile: profile
            })}`
          }
        });
        
        if (account?.provider === 'google') {
          await prisma.executionLog.create({
            data: {
              errorMessage: `Google認証開始: ${user.email}`
            }
          });
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });
          
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                membershipType: 'FREE'
              }
            });
            
            await prisma.executionLog.create({
              data: {
                errorMessage: `Googleユーザー作成成功: ${newUser.id}`
              }
            });
          } else {
            await prisma.executionLog.create({
              data: {
                errorMessage: `既存Googleユーザー: ${existingUser.id}`
              }
            });
          }
        }
        
        return true;
      } catch (error) {
        await prisma.executionLog.create({
          data: {
            errorMessage: `サインインエラー: ${error instanceof Error ? error.message : String(error)}`
          }
        });
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
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
}
