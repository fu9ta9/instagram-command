'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useReplyStore } from '../store/replyStore'
import { Reply, ReplyInput, TabType, MATCH_TYPE } from '../types/reply.types'
import { ReplyApi } from '../services/replyApi'
import { ReplyService } from '../services/replyService'

export function useReplyManager() {
  console.log('🟡 useReplyManager: 開始')
  
  const { data: session, status } = useSession()
  console.log('🟡 useReplyManager: useSession OK', { status, userId: session?.user?.id })
  
  const {
    replies, storyReplies, liveReplies, activeTab, isLoading,
    setReplies, setStoryReplies, setLiveReplies, setIsLoading, clearAll
  } = useReplyStore()
  console.log('🟡 useReplyManager: useReplyStore OK', { activeTab, isLoading })

  // 現在のタブに対応する返信一覧を取得
  const getCurrentReplies = (): Reply[] => {
    switch (activeTab) {
      case 'post': return replies
      case 'story': return storyReplies
      case 'live': return liveReplies
      default: return replies
    }
  }
  
  const setCurrentReplies = (newReplies: Reply[]) => {
    switch (activeTab) {
      case 'post': setReplies(newReplies); break
      case 'story': setStoryReplies(newReplies); break
      case 'live': setLiveReplies(newReplies); break
    }
  }

  // 返信一覧を取得
  useEffect(() => {
    const shouldFetch = status === 'authenticated' || (process.env.NODE_ENV === 'development')
    if (shouldFetch) {
      fetchReplies()
    } else if (status === 'loading') {
      // セッション読み込み中は待機
      return
    } else {
      // セッションなしまたはエラーの場合もローディング終了
      setIsLoading(false)
    }
  }, [session?.user?.id, status])

  // ユーザー切り替え時に状態をリセット
  useEffect(() => {
    clearAll()
  }, [session?.user?.id])

  const fetchReplies = async () => {
    try {
      setIsLoading(true)
      
      // 各タイプの返信を並行して取得
      const [postData, storyData, liveData] = await Promise.all([
        ReplyApi.getReplies('post'),
        ReplyApi.getReplies('story'),
        ReplyApi.getReplies('live')
      ])

      setReplies(postData)
      setStoryReplies(storyData)
      setLiveReplies(liveData)
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveReply = async (data: ReplyInput) => {
    const currentReplies = getCurrentReplies()
    const replyData = {
      ...data,
      replyType: ReplyService.getReplyType(activeTab)
    }
    
    try {
      const newReply = await ReplyApi.createReply(replyData)
      setCurrentReplies([newReply, ...currentReplies])
    } catch (error) {
      console.error('Error saving reply:', error)
      throw error
    }
  }

  const handleUpdateReply = async (replyId: number, data: ReplyInput) => {
    const currentReplies = getCurrentReplies()
    const replyData = {
      ...data,
      replyType: ReplyService.getReplyType(activeTab)
    }
    
    try {
      const updatedReply = await ReplyApi.updateReply(replyId, replyData)
      setCurrentReplies(currentReplies.map((r: Reply) => r.id === updatedReply.id ? updatedReply : r))
    } catch (error) {
      console.error('Error updating reply:', error)
      throw error
    }
  }

  const handleDeleteReply = async (replyId: number) => {
    const currentReplies = getCurrentReplies()
    
    try {
      await ReplyApi.deleteReply(replyId)
      setCurrentReplies(currentReplies.filter((r: Reply) => r.id !== replyId))
    } catch (error) {
      console.error('Error deleting reply:', error)
      throw error
    }
  }

  return {
    currentReplies: getCurrentReplies(),
    isLoading,
    handleSaveReply,
    handleUpdateReply,
    handleDeleteReply,
    refetch: fetchReplies,
  }
}