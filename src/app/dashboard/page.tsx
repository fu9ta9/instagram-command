import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  // セッション確認をスキップ
  // const session = await getServerSession(authOptions)

  // if (!session || !session.user) {
  //   return <div>ログインしてください</div>
  // }

  return <DashboardClient />
}
