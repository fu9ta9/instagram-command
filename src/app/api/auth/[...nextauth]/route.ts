import NextAuth from "next-auth"
import { authOptions } from "./options"

// シンプルな形式に戻す
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }