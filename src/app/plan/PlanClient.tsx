'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from "@prisma/client"
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type UserMembership = {
  type: MembershipType
  trialStartDate?: Date | null
  stripeSubscriptionId?: string | null
  stripeCurrentPeriodEnd?: Date | null
  status?: string | null
}

const getPlanCards = (membership: UserMembership | null) => {
  const plans = []

  // FREEユーザーで、まだトライアルを使用していない場合
  if (membership?.type === 'FREE' && !membership.trialStartDate) {
    plans.push({
      name: 'トライアル',
      price: '¥0',
      interval: '2週間',
      features: [
        'DM自動返信',
      ],
      membershipType: 'TRIAL' as MembershipType,
    })
  }

  // トライアル済みのFREEユーザーの場合
  if (membership?.type === 'FREE' && membership.trialStartDate) {
    plans.push({
      name: 'プロ',
      price: '¥3,980',
      interval: '/月',
      features: [
        'DM自動返信',
      ],
      membershipType: 'PAID' as MembershipType,
    })
  }
  return plans
}

export default function PlanClient() {
  const { data: session, status: sessionStatus } = useSession()
  const [membership, setMembership] = useState<UserMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  useEffect(() => {
    const isTestEnv = process.env.NEXT_PUBLIC_APP_ENV === 'test'
    
    // セッションの読み込み中は待機
    if (sessionStatus === 'loading') {
      return
    }
    
    // テスト環境では常にデータを取得
    if (isTestEnv) {
      fetchMembership()
      return
    }
    
    if (session?.user?.id) {
      fetchMembership()
    } else {
      // セッションがない場合はローディングを終了
      setIsLoading(false)
    }
  }, [session?.user?.id, sessionStatus])

  const fetchMembership = async () => {
    setIsLoading(true)
    try {
      // 統合されたユーザーステータスAPIを使用（期限チェックも含む）
      const response = await fetch('/api/user/status')
      
      if (response.ok) {
        const data = await response.json()
        setMembership({
          type: data.membership.type,
          trialStartDate: data.membership.trialStartDate ? new Date(data.membership.trialStartDate) : null,
          stripeSubscriptionId: data.subscription?.subscriptionId || null,
          stripeCurrentPeriodEnd: data.subscription?.currentPeriodEnd ? new Date(data.subscription.currentPeriodEnd) : null,
          status: data.subscription?.status || null
        })
      } else {
        console.error('API request failed:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching membership:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (type: MembershipType) => {
    setIsUpgrading(true)
    try {
      if (type === 'TRIAL') {
        const response = await fetch('/api/membership/start-trial', {
          method: 'POST',
        })
        if (response.ok) {
          await fetchMembership()
        }
      } else if (type === 'PAID') {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
        })
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      })
      if (response.ok) {
        await fetchMembership()
        setIsCancelDialogOpen(false)
      }
    } catch (error) {
      console.error('Cancel error:', error)
    } finally {
      setIsCanceling(false)
    }
  }

  const getTrialStatus = () => {
    if (membership?.type !== 'TRIAL' || !membership.trialStartDate) return null

    const trialEndDate = addDays(new Date(membership.trialStartDate), 14)
    const daysRemaining = differenceInDays(trialEndDate, new Date())
    const endDate = format(trialEndDate, 'yyyy年MM月dd日', { locale: ja })

    return {
      daysRemaining,
      endDate,
    }
  }

  const getSubscriptionEndDate = () => {
    if (!membership?.stripeCurrentPeriodEnd) return null
    return format(membership.stripeCurrentPeriodEnd, 'yyyy年MM月dd日', { locale: ja })
  }

  const trialStatus = getTrialStatus()
  const subscriptionEndDate = getSubscriptionEndDate()

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const plans = getPlanCards(membership)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">プラン設定</h1>
      
      {membership?.type === 'TRIAL' && trialStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            トライアル期間: あと{trialStatus.daysRemaining}日
            （{trialStatus.endDate}まで）
          </p>
        </div>
      )}

      {membership?.type === 'PAID' && (
        <div className="mb-6">
          {membership.status === 'CANCELING' ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 font-medium">サブスクリプションは解約済みです</p>
              <p className="text-yellow-700">
                {subscriptionEndDate}までは引き続き全ての有料機能をご利用いただけます。<br />
                この日以降は自動的に無料プランに戻ります。
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-blue-800">
                  現在の請求期間: {subscriptionEndDate}まで
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  ※サブスクリプションを停止しても、支払い済みの期間は引き続きサービスをご利用いただけます。
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                サブスクリプションを停止する
              </Button>
            </>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-lg shadow-md p-8 border-2 ${
              plan.membershipType === membership?.type
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-500 ml-1">{plan.interval}</span>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {plan.membershipType === membership?.type ? (
              <Button
                className="w-full bg-blue-500"
                disabled
              >
                現在のプラン
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleUpgrade(plan.membershipType)}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isUpgrading ? 'プラン変更中...' : 
                  plan.membershipType === 'TRIAL' ? 'トライアルを開始' : 'アップグレード'}
              </Button>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>サブスクリプションを停止しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              停止しても、{subscriptionEndDate}までは引き続きサービスをご利用いただけます。
              この日以降は自動的に無料プランに戻ります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="bg-red-500 hover:bg-red-600"
              disabled={isCanceling}
            >
              {isCanceling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isCanceling ? '処理中...' : '停止する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}