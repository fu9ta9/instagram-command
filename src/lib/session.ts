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

const isTest = process.env.APP_ENV === 'test';
const testSession = {
  user: {
    id: 'cmby74xm20000onw682a4i0x2',
    name: 'さかいテスト',
    email: 'sakainoblig@gmail.com',
  },
  expires: '2099-12-31T23:59:59.999Z'
};

// キャッシュを活用したセッション取得
export const getSessionWrapper = cache(async () => {
  if (isTest) return testSession;
  const session = await getServerSession(authOptions)
  if (!session) return null
  return session
})

// セッションユーザーの取得
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (isTest) return testSession.user;
  const session = await getSessionWrapper()
  return session?.user ?? null
}) 