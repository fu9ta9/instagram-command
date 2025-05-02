import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Reply } from '@/types/reply'

interface ReplyState {
  replies: Reply[]
  isModalOpen: boolean
  editingReply: Reply | null
  setReplies: (replies: Reply[]) => void
  setIsModalOpen: (open: boolean) => void
  setEditingReply: (reply: Reply | null) => void
  clearAll: () => void
}

export const useReplyStore = create<ReplyState>()(
  persist(
    (set) => ({
      replies: [],
      isModalOpen: false,
      editingReply: null,
      setReplies: (replies) => set({ replies }),
      setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
      setEditingReply: (editingReply) => set({ editingReply }),
      clearAll: () => set({ replies: [], isModalOpen: false, editingReply: null }),
    }),
    {
      name: 'reply-store',
      partialize: (state) => ({ replies: state.replies }),
    }
  )
) 