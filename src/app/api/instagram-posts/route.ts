import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.facebookAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ここでInstagramの投稿を取得するロジックを実装
  // session.user.facebookAccessToken を使用してAPIリクエストを行う

  return NextResponse.json({ message: "Instagram posts retrieved successfully" })
}
