'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ReplyList from '@/components/ReplyList'
import ReplyRegistrationModal from '@/components/ReplyRegistrationModal'
import { Button } from '@/components/ui/button'
import { PlusIcon, Loader2 } from 'lucide-react'

export default function ReplyClient() {
  const { data: session } = useSession()
  const [replies, setReplies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReply, setEditingReply] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 返信一覧を取得
  useEffect(() => {
    if (session?.user?.id) {
      fetchReplies()
    }
  }, [session?.user?.id])

  const fetchReplies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/replies')
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setEditingReply(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingReply(null)
  }

  const handleEdit = (reply) => {
    console.log("編集するデータ:", reply); // デバッグ用
    
    // matchTypeが数値であることを確認
    const editData = {
      ...reply,
      matchType: typeof reply.matchType === 'number' ? reply.matchType : MATCH_TYPE.PARTIAL
    };
    
    setEditingReply(editData);
    setIsModalOpen(true);
  }

  const handleDelete = async (replyId: string) => {
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 削除成功後、一覧を更新
        fetchReplies()
      } else {
        console.error('Failed to delete reply')
      }
    } catch (error) {
      console.error('Error deleting reply:', error)
    }
  }

  const handleSaveReply = async (replyData) => {
    try {
      let response

      if (editingReply) {
        // 編集の場合
        response = await fetch(`/api/replies/${editingReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(replyData),
        })
      } else {
        // 新規作成の場合
        response = await fetch('/api/replies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(replyData),
        })
      }

      if (response.ok) {
        handleCloseModal()
        fetchReplies()
      } else {
        const errorData = await response.json()
        console.error('Error saving reply:', errorData)
        alert(`保存に失敗しました: ${errorData.message || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error saving reply:', error)
      alert('保存に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-start mb-6">
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          新規返信を登録
        </Button>
      </div>

      <ReplyList
        replies={replies}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReplyRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveReply}
        initialData={editingReply}
        isEditing={!!editingReply}
      />
    </div>
  )
} 