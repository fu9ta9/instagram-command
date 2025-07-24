'use client'

import { create } from 'zustand'
import { Reply, ReplyState, ReplyActions, TabType } from '../types/reply.types'

type ReplyStore = ReplyState & ReplyActions

export const useReplyStore = create<ReplyStore>((set) => {
  console.log('🔵 useReplyStore: 初期化開始')
  return {
    // State
    replies: [],
    storyReplies: [],
    liveReplies: [],
    isModalOpen: false,
    editingReply: null,
    isLoading: false,
    activeTab: 'post' as TabType,

    // Actions
    setReplies: (replies: Reply[]) => set({ replies }),
    setStoryReplies: (storyReplies: Reply[]) => set({ storyReplies }),
    setLiveReplies: (liveReplies: Reply[]) => set({ liveReplies }),
    setIsModalOpen: (isModalOpen: boolean) => set({ isModalOpen }),
    setEditingReply: (editingReply: Reply | null) => set({ editingReply }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setActiveTab: (activeTab: TabType) => set({ activeTab }),
    clearAll: () => set({
      replies: [],
      storyReplies: [],
      liveReplies: [],
      isModalOpen: false,
      editingReply: null,
      isLoading: false,
    }),
  }
})