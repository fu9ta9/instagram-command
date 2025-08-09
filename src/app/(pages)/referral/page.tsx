import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, DollarSign, Clock, Users, Target, TrendingUp, CreditCard, CheckCircle } from "lucide-react"

export default function ReferralPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">テスター向け紹介制度について</h1>
          <p className="text-lg text-gray-600">
            いつもサービステストにご協力いただき、ありがとうございます。<br />
            より多くのユーザーにサービスをお試しいただくため、紹介制度を実施いたします。
          </p>
        </div>

        {/* 制度の目的 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              制度の目的
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">アクティブユーザーの増加</h3>
                  <p className="text-gray-600 text-sm">より多くの方にサービスを体験していただき、フィードバックを収集</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">サービス拡充のため収益性を高める</h3>
                  <p className="text-gray-600 text-sm">持続的なサービス運営・機能改善のための基盤づくり</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 紹介報酬の条件 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              紹介報酬の条件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">達成条件</h3>
              <p className="text-gray-600 mb-4">以下の条件をすべて満たした場合に報酬をお支払いします：</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-700">プロプランへのアップグレード</h4>
                    <p className="text-sm text-gray-600 mt-1">紹介されたユーザーが2週間のトライアル後、有料のプロプランに登録</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-700">紹介経路の確認</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      紹介されたユーザーが○○さん経由で登録したことが確認できること<br />
                      私のアカウントから紹介されたユーザーへメッセージを送り、紹介者を確認させていただきます
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 報酬金額 */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              報酬金額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">4,000円</div>
            <p className="text-green-600">プロプラン1ヶ月分相当</p>
          </CardContent>
        </Card>

        {/* 支払い方法 */}
        <Card>
          <CardHeader>
            <CardTitle>支払い方法</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">以下の方法からご希望をお聞かせください：</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant="outline">選択肢1</Badge>
                銀行振込
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">選択肢2</Badge>
                PayPay
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">選択肢3</Badge>
                その他ご希望の方法（要相談）
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 支払い期限 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              支払い期限
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>達成条件を満たしてから<span className="font-semibold text-blue-600">1週間以内</span>に迅速にお支払いいたします。</p>
          </CardContent>
        </Card>

        {/* 重要な注意事項 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              重要な注意事項
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">税務について</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• 報酬は所得として扱われます</li>
                <li>• 年間の副業所得が20万円を超える場合は確定申告が必要です</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">その他</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• 紹介されたユーザーが短期間で解約された場合の取り扱いについては個別にご相談させていただきます</li>
                <li>• 制度に関してご不明な点がございましたら、お気軽にお声がけください</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 締めの言葉 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-center text-gray-700">
              この紹介制度は、日頃のテスト協力への感謝の気持ちと、サービス成長のためのご協力をお願いする制度です。<br />
              引き続きよろしくお願いいたします。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}