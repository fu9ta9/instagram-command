'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from '@prisma/client'
import { UserMembership } from '../types/subscription.types'
import { MembershipApi } from '../services/membershipApi'

export function useSubscriptionManager() {
  const { data: session } = useSession()
  const [membership, setMembership] = useState<UserMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchMembership()
    }
  }, [session?.user?.id])

  const fetchMembership = async () => {
    try {
      if (!session?.user?.id) return
      
      // まずexpire-trialを呼び出して、必要ならFREEに戻す
      await MembershipApi.expireTrial(session.user.id)
      
      // その後、最新のmembership情報を取得
      const data = await MembershipApi.getMembership(session.user.id)
      setMembership({
        type: data.membershipType,
        trialStartDate: data.trialStartDate ? new Date(data.trialStartDate) : null,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd ? new Date(data.stripeCurrentPeriodEnd) : null,
        status: data.status
      })
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
        await MembershipApi.startTrial()
        await fetchMembership()
      } else if (type === 'PAID') {
        const data = await MembershipApi.createCheckoutSession()
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
      await MembershipApi.cancelSubscription()
      await fetchMembership()
    } catch (error) {
      console.error('Cancel error:', error)
    } finally {
      setIsCanceling(false)
    }
  }

  return {
    membership,
    isLoading,
    isUpgrading,
    isCanceling,
    handleUpgrade,
    handleCancelSubscription,
    refetch: fetchMembership,
  }
}