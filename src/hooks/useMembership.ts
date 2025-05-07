import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from '@prisma/client'

export type MembershipInfo = {
  membershipType: MembershipType | null
  trialStartDate?: string | null
  status?: string | null
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
      // 1. GETで会員情報取得
      const res = await fetch(`/api/membership/${session.user.id}`)
      if (!res.ok) throw new Error('会員情報の取得に失敗しました')
      const data = await res.json()
      setMembership({
        membershipType: data.membershipType,
        trialStartDate: data.trialStartDate,
        status: data.status
      })

      // 2. TRIALかつ期限切れなら更新APIを呼ぶ
      if (data.membershipType === 'TRIAL' && data.trialStartDate) {
        const trialStart = new Date(data.trialStartDate)
        const now = new Date()
        const diff = now.getTime() - trialStart.getTime()
        if (diff > 14 * 24 * 60 * 60 * 1000) {
          // 期限切れなので更新APIをPOST
          await fetch('/api/membership/expire-trial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id })
          })
          // 再取得
          const res2 = await fetch(`/api/membership/${session.user.id}`)
          if (res2.ok) {
            const data2 = await res2.json()
            setMembership({
              membershipType: data2.membershipType,
              trialStartDate: data2.trialStartDate,
              status: data2.status
            })
          }
        }
      }
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