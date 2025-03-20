import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";

// Session型を拡張
interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    instagram?: {
      connected: boolean;  // 接続状態のみを保持
    };
  } & Session['user']
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret:process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
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
          redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/facebook-callback`,
          response_type: "token",
          scope: [
            'instagram_basic',
            'instagram_manage_messages',
            'pages_manage_metadata',
            'instagram_manage_comments',
            'pages_show_list',
          ].join(',')
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          await prisma.executionLog.create({
            data: {
              errorMessage: 'Credentials認証: 必要な情報が不足しています'
            }
          });
          return null;
        }

        try {
          // ユーザーを検索
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            await prisma.executionLog.create({
              data: {
                errorMessage: `Credentials認証: ユーザーが見つかりません - ${credentials.email}`
              }
            });
            return null;
          }

          // パスワードを検証
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            await prisma.executionLog.create({
              data: {
                errorMessage: `Credentials認証: パスワードが一致しません - ${credentials.email}`
              }
            });
            return null;
          }

          await prisma.executionLog.create({
            data: {
              errorMessage: `Credentials認証成功: ${user.email}`
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            provider: 'credentials',
          };
        } catch (error) {
          await prisma.executionLog.create({
            data: {
              errorMessage: `Credentials認証エラー: ${error instanceof Error ? error.message : String(error)}`
            }
          });
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // ログを追加してデバッグ
      await prisma.executionLog.create({
        data: {
          errorMessage: `サインイン試行: ${JSON.stringify({ 
            user: user, 
            accountType: account?.provider 
          })}`
        }
      });
      
      if (account?.provider === 'google') {
        // Googleログイン時の処理
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        
        if (!existingUser) {
          // 新規ユーザーの場合は作成
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              membershipType: 'FREE'
            }
          });
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      // デバッグログ
      await prisma.executionLog.create({
        data: {
          errorMessage: `JWT処理:
          Token: ${JSON.stringify(token)}
          User: ${JSON.stringify(user)}
          Account: ${JSON.stringify(account)}`
        }
      });
      
      // userが存在する場合（初回ログイン時）
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // デバッグログを追加
      await prisma.executionLog.create({
        data: {
          errorMessage: `Session Callback: ${JSON.stringify({ 
            session: session, 
            token: token 
          })}`
        }
      });
      
      if (session?.user) {
        session.user.id = token.id as string;

        // IGAccountの存在確認のみ行う
        const igAccount = await prisma.iGAccount.findFirst({
          where: { userId: token.id as string },
          select: { id: true }
        });

        session.user.instagram = {
          connected: !!igAccount  // 接続状態のみを保持
        };
      }
      return session as CustomSession;
    }
  },
  pages: {
    signIn: '/dashboard',
    error: '/auth/error',
  },
  debug: true,
  events: {
    async signOut({ session }) {
      // セッションを確実に削除
      if (session?.user?.id) {
        await prisma.session.deleteMany({
          where: { userId: session.user.id }
        });
        await prisma.executionLog.create({
          data: {
            errorMessage: `ログアウト完了: UserID=${session.user.id}`
          }
        });
      }
    }
  },
  session: {
    strategy: "jwt",  // JWTベースのセッション管理
  },
}
