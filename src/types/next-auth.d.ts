import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      membershipType: string
      facebookAccessToken?: string
      // 他の既存のプロパティ
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    facebookAccessToken?: string
  }
}
