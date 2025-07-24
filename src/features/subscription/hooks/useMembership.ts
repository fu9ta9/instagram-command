'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from '@prisma/client'
import { MembershipInfo } from '../types/subscription.types'
import { MembershipApi } from '../services/membershipApi'

export function useMembership() {
  console.log('🟢 useMembership: 開始')
  
  const { data: session } = useSession()
  
  // 開発環境用のテストセッション
  const isDevelopment = process.env.NODE_ENV === 'development'
  const testSession = isDevelopment && !session ? {
    user: {
      id: 'cmby74xm20000onw682a4i0x2',
      name: 'さかいテスト',
      email: 'sakainoblig@gmail.com',
    },
    expires: '2099-12-31T23:59:59.999Z'
  } : null
  
  const effectiveSession = session || testSession
  console.log('🟢 useMembership: useSession取得完了', { 
    session: !!effectiveSession, 
    userId: effectiveSession?.user?.id,
    isTestSession: !!testSession
  })
  
  const [membership, setMembership] = useState<MembershipInfo>({ membershipType: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  console.log('🟢 useMembership: state初期化 OK', { membership, isLoading, error })

  const fetchMembership = useCallback(async () => {
    if (!effectiveSession?.user?.id) {
      console.log('🟢 useMembership: effectiveSession.user.id がない')
      return
    }
    console.log('🟢 useMembership: fetchMembership開始', { userId: effectiveSession.user.id })
    setIsLoading(true)
    setError(null)
    try {
      // 1. トライアル期限切れチェック
      console.log('🟢 useMembership: トライアル期限切れチェック開始')
      await MembershipApi.expireTrial(effectiveSession.user.id)
      
      // 2. 最新のメンバーシップ情報取得
      console.log('🟢 useMembership: API呼び出し開始', `/api/membership/${effectiveSession.user.id}`)
      const data = await MembershipApi.getMembership(effectiveSession.user.id)
      console.log('🟢 useMembership: API レスポンス', JSON.stringify(data, null, 2))
      
      setMembership({
        membershipType: data.membershipType,
        trialStartDate: data.trialStartDate,
        status: data.status
      })
    } catch (e: any) {
      console.error('🟢 useMembership: エラー発生', e)
      setError(e.message || '不明なエラー')
    } finally {
      console.log('🟢 useMembership: fetchMembership完了')
      setIsLoading(false)
    }
  }, [effectiveSession?.user?.id])

  useEffect(() => {
    console.log('🟢 useMembership: useEffect実行', { effectiveSession: !!effectiveSession, userId: effectiveSession?.user?.id })
    if (effectiveSession?.user?.id) {
      console.log('🟢 useMembership: fetchMembership直接呼び出し')
      fetchMembership()
    } else {
      console.log('🟢 useMembership: effectiveSessionまたはuserIdがない', { effectiveSession: !!effectiveSession, userId: effectiveSession?.user?.id })
      setIsLoading(false)
    }
  }, [effectiveSession?.user?.id, fetchMembership])

  return {
    ...membership,
    isLoading,
    error,
    refetch: fetchMembership
  }
}