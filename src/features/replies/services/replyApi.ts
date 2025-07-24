'use client'

import { ReplyInput, Reply, TabType, REPLY_TYPE } from '../types/reply.types'

export class ReplyApi {
  /**
   * 返信一覧を取得
   */
  static async getReplies(type: 'post' | 'story' | 'live'): Promise<Reply[]> {
    const response = await fetch(`/api/replies?type=${type}`)
    if (!response.ok) {
      throw new Error(`返信一覧の取得に失敗しました (${type})`)
    }
    return response.json()
  }

  /**
   * 返信を作成
   */
  static async createReply(data: ReplyInput): Promise<Reply> {
    const response = await fetch('/api/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { 
        status: response.status,
        message: errorData.details || errorData.error || '返信の登録に失敗しました'
      }
    }
    
    return response.json()
  }

  /**
   * 返信を更新
   */
  static async updateReply(replyId: number, data: ReplyInput): Promise<Reply> {
    const response = await fetch(`/api/replies/${replyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { 
        status: response.status,
        message: errorData.details || errorData.error || '返信の更新に失敗しました'
      }
    }
    
    return response.json()
  }

  /**
   * 返信を削除
   */
  static async deleteReply(replyId: number): Promise<void> {
    const response = await fetch(`/api/replies/${replyId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('返信の削除に失敗しました')
    }
  }
}