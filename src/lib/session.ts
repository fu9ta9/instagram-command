import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { cache } from 'react'

// セッション情報の型定義
export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  instagram?: {
    id: string
    name: string
    profile_picture_url?: string
  } | null
}

// キャッシュを活用したセッション取得
export const getSession = cache(async () => {
  const session = await getServerSession(authOptions)
  if (!session) return null
  
  return session
})

// セッションユーザーの取得
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession()
  return session?.user ?? null
}) 