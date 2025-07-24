import { TabType, REPLY_TYPE } from '../types/reply.types'

export class ReplyService {
  /**
   * タブタイプからREPLY_TYPEに変換
   */
  static getReplyType(tab: TabType): REPLY_TYPE {
    switch (tab) {
      case 'post': return REPLY_TYPE.POST
      case 'story': return REPLY_TYPE.STORY
      case 'live': return REPLY_TYPE.LIVE
      default: return REPLY_TYPE.POST
    }
  }

  /**
   * タブに応じた新規登録ボタンテキストを取得
   */
  static getRegistrationButtonText(tab: TabType): string {
    switch (tab) {
      case 'post': return '新規登録（フィード/リール用）'
      case 'story': return '新規登録（ストーリー用）'
      case 'live': return '新規登録（LIVE用）'
      default: return '新規登録（フィード/リール用）'
    }
  }

  /**
   * ストーリーモードかどうかを判定
   */
  static isStoryMode(tab: TabType): boolean {
    return tab === 'story' || tab === 'live'
  }
}