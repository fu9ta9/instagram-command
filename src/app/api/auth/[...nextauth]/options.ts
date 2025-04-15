import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"
import type { Session } from "next-auth"
import bcrypt from 'bcryptjs'

// Instagram情報の型定義
interface InstagramData {
  id: string;
  name: string;
  profile_picture_url?: string;
}

// Session型を拡張
interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    instagram?: InstagramData | null;
  } & Session['user']
}

// Instagram情報更新用の関数
export async function updateInstagramSession(
  userId: string,
  data?: {
    id: string;
    username: string;
    profilePictureUrl: string | null;
  }
): Promise<InstagramData | null> {
  try {
    if (data) {
      // 直接データが提供された場合
      return {
        id: data.id,
        name: data.username,
        profile_picture_url: data.profilePictureUrl || undefined
      };
    }

    // データが提供されない場合はDBから取得
    const igAccount = await prisma.iGAccount.findFirst({
      where: { userId },
      select: { 
        id: true,
        username: true,
        profilePictureUrl: true
      }
    });
    
    if (!igAccount?.id) {
      return null;
    }

    return {
      id: igAccount.id,
      name: igAccount.username,
      profile_picture_url: igAccount.profilePictureUrl || undefined
    };
  } catch (error) {
    console.error('Error updating Instagram session:', error);
    return null;
  }
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
          access_type: "offline",
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) {
        console.error("Account object is missing in signIn callback");
        return false;
      }

      try {
        if (account.provider === 'google') {
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
        console.error("Error in signIn callback:", error);
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
          session.user.instagram = await updateInstagramSession(token.id as string);
        } catch (error) {
          console.error('Error fetching Instagram account:', error);
          session.user.instagram = null;
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
