import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, MessageCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                インスタグラム分析・運用ツール
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                投稿ランキング、アカウント分析、自動返信機能で、あなたのインスタグラムアカウントを最適化します。
              </p>
            </div>
            <div className="space-x-4">
              <Button>無料で始める</Button>
              <Button variant="outline">詳細を見る</Button>
            </div>
          </div>
        </div>
      </section>
      {/* 他のセクションも同様に追加 */}
    </main>
  )
}