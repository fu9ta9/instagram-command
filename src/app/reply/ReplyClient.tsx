'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ReplyList from '@/components/ReplyList'
import ReplyRegistrationModal from '@/components/ReplyRegistrationModal'
import { Button } from '@/components/ui/button'
import { PlusIcon, Loader2, Grid3X3, PlayCircle } from 'lucide-react'
import { Reply, ReplyInput, ReplyFormData } from '@/types/reply'
import { useReplyStore } from '@/store/replyStore'
import { useRouter } from 'next/navigation'
import { useMembership } from '@/hooks/useMembership'

enum MATCH_TYPE {
  EXACT = 0,
  PARTIAL = 1,
  REGEX = 2
}

enum REPLY_TYPE {
  POST = 1,
  STORY = 2
}

type TabType = 'post' | 'story'

export default function ReplyClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    replies, isModalOpen, editingReply,
    setReplies, setIsModalOpen, setEditingReply, clearAll
  } = useReplyStore()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('post')
  const [storyReplies, setStoryReplies] = useState<Reply[]>([])
  const {
    membershipType,
    isLoading: isMembershipLoading
  } = useMembership()

  // 現在のタブに対応する返信一覧を取得
  const currentReplies = activeTab === 'post' ? replies : storyReplies
  const setCurrentReplies = activeTab === 'post' ? setReplies : setStoryReplies

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
    setStoryReplies([])
  }, [session?.user?.id])

  const fetchReplies = async () => {
    try {
      setIsLoading(true)
      // 投稿用返信を取得
      const postResponse = await fetch('/api/replies?type=post')
      if (postResponse.ok) {
        const postData = await postResponse.json()
        setReplies(postData)
      }

      // ストーリー用返信を取得
      const storyResponse = await fetch('/api/replies?type=story')
      if (storyResponse.ok) {
        const storyData = await storyResponse.json()
        setStoryReplies(storyData)
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
    const editData = {
      ...reply,
      matchType: typeof reply.matchType === 'number' ? reply.matchType : MATCH_TYPE.PARTIAL
    }
    setEditingReply(editData)
    setIsModalOpen(true)
  }

  const handleDelete = async (replyId: string) => {
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
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
      
      // 現在のタブに応じてreplyTypeを設定
      const replyData = {
        ...data,
        replyType: activeTab === 'post' ? REPLY_TYPE.POST : REPLY_TYPE.STORY
      }
      
      if (editingReply) {
        const response = await fetch(`/api/replies/${editingReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(replyData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw { 
            status: response.status,
            message: errorData.details || errorData.error || '返信の更新に失敗しました'
          };
        }
        const updatedReply = await response.json();
        setCurrentReplies(currentReplies.map((r: Reply) => r.id === updatedReply.id ? updatedReply : r));
      } else {
        const response = await fetch('/api/replies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(replyData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw { 
            status: response.status,
            message: errorData.details || errorData.error || '返信の登録に失敗しました'
          };
        }
        const newReply = await response.json();
        setCurrentReplies([newReply, ...currentReplies]);
      }
      setIsModalOpen(false);
      setEditingReply(null);
    } catch (error) {
      console.error('Error saving reply:', error);
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
      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('post')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'post'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              フィード/リール
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'story'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              ストーリー
            </button>
          </nav>
        </div>
      </div>

      <div className="flex justify-start mb-6">
        {membershipType === 'FREE' ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => router.push('/plan')}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white w-56"
            >
              会員をアップグレード
            </Button>
            {currentReplies.length > 0 ? (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded text-sm w-full">
                無料会員の場合、登録済みの返信文は自動返信されません。有料プランにアップグレードしてください。
              </div>
            ) : (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm w-full">
                自動返信は有料会員の機能です。有料プランにアップグレードしてください。
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={handleOpenModal}
            className="flex items-center gap-2"
            disabled={isMembershipLoading}
          >
            <PlusIcon className="h-4 w-4" />
            {activeTab === 'post' ? '新規返信を登録（フィード/リール用）' : '新規返信を登録（ストーリー用）'}
          </Button>
        )}
      </div>

      <ReplyList
        replies={currentReplies}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReplyRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveReply}
        initialData={editingReply as ReplyFormData}
        isEditing={!!editingReply}
        isStoryMode={activeTab === 'story'}
      />
    </div>
  )
} 