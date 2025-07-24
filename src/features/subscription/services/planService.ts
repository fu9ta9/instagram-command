import { MembershipType } from '@prisma/client'
import { UserMembership, PlanCard } from '../types/subscription.types'

export class PlanService {
  /**
   * ユーザーのメンバーシップ状態に基づいて利用可能なプランを取得
   */
  static getPlanCards(membership: UserMembership | null): PlanCard[] {
    const plans: PlanCard[] = []

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
}