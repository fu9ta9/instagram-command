"use client"

import { InstagramAccount } from '../types/search.types'

// ローカルストレージのキー
const RECENT_ACCOUNTS_KEY = "instagram-recent-accounts"

export class StorageService {
  /**
   * 最近検索したアカウントをローカルストレージから読み込む
   */
  static loadRecentAccounts(): InstagramAccount[] {
    try {
      const savedAccounts = localStorage.getItem(RECENT_ACCOUNTS_KEY)
      if (savedAccounts) {
        return JSON.parse(savedAccounts)
      }
      return []
    } catch (error) {
      console.error("保存されたアカウントの解析エラー:", error)
      return []
    }
  }

  /**
   * 最近検索したアカウントを保存
   */
  static saveRecentAccount(
    account: InstagramAccount, 
    currentAccounts: InstagramAccount[]
  ): InstagramAccount[] {
    // 既存のアカウントリストから同じIDのアカウントを除外
    const filteredAccounts = currentAccounts.filter(a => a.id !== account.id)
    
    // 新しいアカウントを先頭に追加（最大5件まで保存）
    const updatedAccounts = [account, ...filteredAccounts].slice(0, 5)
    
    // ローカルストレージに保存
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    
    return updatedAccounts
  }
}