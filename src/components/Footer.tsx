import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サービス情報 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">インスタコマンド</h3>
            <p className="text-gray-300 mb-4">
              Instagram DM自動返信サービス。効率的なカスタマーサポートを実現します。
            </p>
            <p className="text-sm text-gray-400">
              © 2024 インスタコマンド. All rights reserved.
            </p>
          </div>

          {/* サービス */}
          <div>
            <h4 className="text-lg font-semibold mb-4">サービス</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/connect" className="text-gray-300 hover:text-white transition-colors">
                  Instagram連携
                </Link>
              </li>
              <li>
                <Link href="/reply" className="text-gray-300 hover:text-white transition-colors">
                  DM自動返信設定
                </Link>
              </li>
              <li>
                <Link href="/plan" className="text-gray-300 hover:text-white transition-colors">
                  プラン設定
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">法的情報</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-gray-300 hover:text-white transition-colors">
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 下部のコピーライト */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            運営者: 福原 拓哉 | お問い合わせ: sakainoblog@gmail.com
          </p>
        </div>
      </div>
    </footer>
  )
} 