import { format, differenceInDays, addDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { UserMembership, TrialStatus } from '../types/subscription.types'

export class DateService {
  /**
   * トライアルステータス（残り日数・終了日）を計算
   */
  static getTrialStatus(membership: UserMembership): TrialStatus | null {
    if (membership.type !== 'TRIAL' || !membership.trialStartDate) return null

    const trialEndDate = addDays(new Date(membership.trialStartDate), 14)
    const daysRemaining = differenceInDays(trialEndDate, new Date())
    const endDate = format(trialEndDate, 'yyyy年MM月dd日', { locale: ja })

    return {
      daysRemaining,
      endDate,
    }
  }

  /**
   * サブスクリプション終了日を日本語形式でフォーマット
   */
  static getSubscriptionEndDate(membership: UserMembership): string | null {
    if (!membership.stripeCurrentPeriodEnd) return null
    return format(membership.stripeCurrentPeriodEnd, 'yyyy年MM月dd日', { locale: ja })
  }
}