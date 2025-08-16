import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from '@prisma/client'

export type MembershipInfo = {
  membershipType: MembershipType | null
  trialStartDate?: string | null
  status?: string | null
  trialInfo?: {
    daysRemaining: number
    endDate: string
  } | null
  subscriptionInfo?: {
    status: string
    currentPeriodEnd: string
  } | null
}

export function useMembership() {
  const { data: session } = useSession()
  const [membership, setMembership] = useState<MembershipInfo>({ membershipType: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembership = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    try {
      // 統合されたユーザーステータスAPIを使用
      const res = await fetch('/api/user/status')
      if (!res.ok) throw new Error('会員情報の取得に失敗しました')
      const data = await res.json()
      
      setMembership({
        membershipType: data.membership.type,
        trialStartDate: data.membership.trialStartDate,
        status: data.subscription?.status || null,
        trialInfo: data.trial ? {
          daysRemaining: data.trial.daysRemaining,
          endDate: data.trial.endDate
        } : null,
        subscriptionInfo: data.subscription ? {
          status: data.subscription.status,
          currentPeriodEnd: data.subscription.currentPeriodEnd
        } : null
      })
    } catch (e: any) {
      setError(e.message || '不明なエラー')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchMembership()
  }, [fetchMembership])

  return {
    ...membership,
    isLoading,
    error,
    refetch: fetchMembership
  }
} 