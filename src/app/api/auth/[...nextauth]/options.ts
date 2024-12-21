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
    provider: string;
    accessToken: string;
  } & Session["user"];
}

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
              channel: "Instagram_Onboarding"
            }
          }),
          redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/facebook-callback`,
          response_type: "token",
          scope: [
            'instagram_basic',
            // 'instagram_manage_comments',
            // 'pages_show_list',
            // 'pages_read_engagement'
          ].join(',')
        }
      },
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
      if (!account || !user) {
        await prisma.executionLog.create({
          data: {
            errorMessage: 'SignInエラー: アカウントまたはユーザー情報なし'
          }
        });
        return false;
      }

      try {
        // Googleログインの場合のみユーザー登録
        if (account.provider === 'google') {
          await prisma.user.upsert({
            where: { 
              email: user.email! 
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              membershipType: 'FREE'  // register/route.tsと同じ初期値
            },
            update: {
              name: user.name,
              image: user.image,
            }
          });

          await prisma.executionLog.create({
            data: {
              errorMessage: `Googleユーザー登録/更新成功: ${user.email}`
            }
          });
        }

        return true;
      } catch (error) {
        await prisma.executionLog.create({
          data: {
            errorMessage: `ユーザー登録エラー: ${error instanceof Error ? error.message : String(error)}`
          }
        });
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // トークンに認証情報を保存
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
        token.type = account.type;
        token.providerAccountId = account.providerAccountId;
        token.access_token = account.access_token;
        token.token_type = account.token_type;
        token.expires_at = account.expires_at;
        token.scope = account.scope;
      }
      return token;
    },

    async session({ session, token }): Promise<CustomSession> {
      // セッションにユーザー情報を設定
      if (session.user) {
        const customSession = session as CustomSession;  // ここを追加
        customSession.user.id = token.id as string;
        customSession.user.provider = token.provider as string;
        customSession.user.accessToken = token.accessToken as string;

        try {
          // アカウント情報をDBに保存/更新
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: token.provider as string,
                providerAccountId: token.providerAccountId as string
              }
            },
            create: {
              userId: token.id as string,
              type: token.type as string,
              provider: token.provider as string,
              providerAccountId: token.providerAccountId as string,
              access_token: token.access_token as string,
              token_type: token.token_type as string,
              expires_at: token.expires_at as number,
              scope: token.scope as string,
            },
            update: {
              access_token: token.access_token as string,
              token_type: token.token_type as string,
              expires_at: token.expires_at as number,
              scope: token.scope as string,
            }
          });
  
          // アクセストークンを使用してFacebookページ情報を取得
          if (token.access_token) {
            const pagesResponse = await fetch(
              `https://graph.facebook.com/v11.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,name,username}&access_token=${token.access_token}`
            );
            
            if (pagesResponse.ok) {
              const pagesData = await pagesResponse.json();
              await prisma.executionLog.create({
                data: {
                  errorMessage: `Facebookページ情報取得成功: ${JSON.stringify(pagesData)}`
                }
              });
  
              // Instagram Business Account情報があれば保存
              const page = pagesData.data?.[0];
              if (page?.instagram_business_account) {
                await prisma.account.update({
                  where: {
                    provider_providerAccountId: {
                      provider: token.provider as string,
                      providerAccountId: token.providerAccountId as string
                    }
                  },
                  data: {
                    access_token: page.access_token,
                    providerAccountId: page.instagram_business_account.id,
                    scope: token.scope as string
                  }
                });
  
                await prisma.executionLog.create({
                  data: {
                    errorMessage: `Instagram Business Account更新:
                    ID: ${page.instagram_business_account.id}
                    Username: ${page.instagram_business_account.username}
                    Access Token: ${page.access_token.substring(0, 10)}...`
                  }
                });
              }
            }
          }
  
  
          return session as CustomSession;
        } catch (error) {
          await prisma.executionLog.create({
            data: {
              errorMessage: `アカウント保��エラー: ${error instanceof Error ? error.message : String(error)}`
            }
          });
        }
        return session as CustomSession;
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
