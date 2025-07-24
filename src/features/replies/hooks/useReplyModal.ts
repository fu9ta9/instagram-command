'use client'

import { useReplyStore } from '../store/replyStore'
import { Reply, ReplyFormData, MATCH_TYPE } from '../types/reply.types'

export function useReplyModal() {
  console.log('🟣 useReplyModal: 開始')
  
  const {
    isModalOpen, editingReply,
    setIsModalOpen, setEditingReply
  } = useReplyStore()
  console.log('🟣 useReplyModal: useReplyStore OK', { isModalOpen, editingReply })

  const handleOpenModal = () => {
    setEditingReply(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingReply(null)
  }

  const handleEdit = (reply: Reply) => {
    const editData = {
      ...reply,
      matchType: typeof reply.matchType === 'number' ? reply.matchType : MATCH_TYPE.PARTIAL
    }
    setEditingReply(editData)
    setIsModalOpen(true)
  }

  return {
    isModalOpen,
    editingReply: editingReply as ReplyFormData,
    isEditing: !!editingReply,
    handleOpenModal,
    handleCloseModal,
    handleEdit,
  }
}