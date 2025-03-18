'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ReplyList from '@/components/ReplyList'
import ReplyRegistrationModal from '@/components/ReplyRegistrationModal'
import { Button } from '@/components/ui/button'
import { PlusIcon, Loader2 } from 'lucide-react'
import { Reply, ReplyInput, ReplyFormData } from '@/types/reply'

enum MATCH_TYPE {
  EXACT = 0,
  PARTIAL = 1,
  REGEX = 2
}

export default function ReplyClient() {
  const { data: session } = useSession()
  const [replies, setReplies] = useState<Reply[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReply, setEditingReply] = useState<Reply | null>(null)
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

  const handleEdit = (reply: Reply) => {
    console.log("編集するデータ:", reply);
    
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

  const handleSaveReply = async (data: ReplyInput | Omit<Reply, "id">) => {
    try {
      setIsLoading(true);
      
      // 編集モードかどうかを確認
      if (editingReply) {
        // 編集の場合はPUTリクエスト
        const response = await fetch(`/api/replies/${editingReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { 
            status: response.status,
            message: errorData.details || errorData.error || '返信の更新に失敗しました'
          };
        }

        const updatedReply = await response.json();
        
        // 返信リストを更新
        setReplies(replies.map((r: Reply) => r.id === updatedReply.id ? updatedReply : r));
      } else {
        // 新規作成の場合はPOSTリクエスト
        const response = await fetch('/api/replies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { 
            status: response.status,
            message: errorData.details || errorData.error || '返信の登録に失敗しました'
          };
        }

        const newReply = await response.json();
        setReplies([newReply, ...replies]);
      }
      
      // モーダルを閉じて編集状態をリセット
      setIsModalOpen(false);
      setEditingReply(null);
    } catch (error) {
      console.error('Error saving reply:', error);
      // エラーを上位コンポーネントに伝播
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
        initialData={editingReply as ReplyFormData}
        isEditing={!!editingReply}
      />
    </div>
  )
} 