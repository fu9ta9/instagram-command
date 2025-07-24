export class MembershipApi {
  /**
   * ユーザーのメンバーシップ情報を取得
   */
  static async getMembership(userId: string) {
    const response = await fetch(`/api/membership/${userId}`)
    if (!response.ok) {
      throw new Error('会員情報の取得に失敗しました')
    }
    return response.json()
  }

  /**
   * トライアル期限切れチェック・更新
   */
  static async expireTrial(userId: string) {
    const response = await fetch('/api/membership/expire-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) {
      throw new Error('トライアル期限切れ処理に失敗しました')
    }
    return response.json()
  }

  /**
   * トライアル開始
   */
  static async startTrial() {
    const response = await fetch('/api/membership/start-trial', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('トライアル開始に失敗しました')
    }
    return response.json()
  }

  /**
   * Stripe決済セッション作成
   */
  static async createCheckoutSession() {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('決済セッション作成に失敗しました')
    }
    return response.json()
  }

  /**
   * サブスクリプション解約
   */
  static async cancelSubscription() {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('サブスクリプション解約に失敗しました')
    }
    return response.json()
  }
}