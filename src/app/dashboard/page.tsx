import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/options"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return <div>ログインしてください</div>
  }

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user.name}さん</p>
      {session.user.facebookAccessToken ? (
        <p>Facebookと連携済みです</p>
      ) : (
        <p>Facebookとの連携が必要です</p>
      )}
      {/* 他のダッシュボードコンテンツ */}
    </div>
  )
}
