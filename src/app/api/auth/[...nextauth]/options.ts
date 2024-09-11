// import { NextAuthOptions } from "next-auth"
// import FacebookProvider from "next-auth/providers/facebook"
// import GoogleProvider from "next-auth/providers/google"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
// import { Adapter } from "next-auth/adapters"

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma) as Adapter,
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, account }) {
//       if (account) {
//         token.accessToken = account.access_token
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (session) {
//         session.accessToken = token.accessToken as string
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: '/login',
//   },
//   debug: true, // デバッグモードを有効にする
// }

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Adapter } from "next-auth/adapters"

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
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id; // または token.sub
      }
      return session;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
}