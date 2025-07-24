'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusIcon, Loader2, Grid3X3, CircleUser, Radio } from 'lucide-react'
import ReplyList from './ReplyList'
import ReplyRegistrationModal from './ReplyRegistrationModal'
import { useReplyStore } from '../store/replyStore'
import { useReplyManager } from '../hooks/useReplyManager'
import { useReplyModal } from '../hooks/useReplyModal'
import { ReplyService } from '../services/replyService'
import { TabType } from '../types/reply.types'
import { SerializableMembershipData } from '@/features/subscription/services/membershipServerService'

interface ReplyClientProps {
  initialMembershipData: SerializableMembershipData
  userId: string
}

export function ReplyClient({ initialMembershipData, userId }: ReplyClientProps) {
  const [mounted, setMounted] = useState(false)
  const [membershipData, setMembershipData] = useState(initialMembershipData)
  const router = useRouter()

  // クライアントサイドでのマウントを確認
  useEffect(() => {
    setMounted(true)
  }, [])

  console.log('🔴 ReplyClient: 開始', { mounted, membershipData })
  
  const { activeTab, setActiveTab } = useReplyStore()
  console.log('🔴 ReplyClient: useReplyStore OK', { activeTab })
  
  const { currentReplies, isLoading, handleSaveReply, handleUpdateReply, handleDeleteReply } = useReplyManager()
  console.log('🔴 ReplyClient: useReplyManager OK', { currentReplies, isLoading })
  
  const { isModalOpen, editingReply, isEditing, handleOpenModal, handleCloseModal, handleEdit } = useReplyModal()
  console.log('🔴 ReplyClient: useReplyModal OK', { isModalOpen, isEditing })

  const handleSaveReplyWithState = async (data: any) => {
    try {
      if (isEditing && editingReply?.id) {
        await handleUpdateReply(editingReply.id, data)
      } else {
        await handleSaveReply(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving reply:', error)
      throw error
    }
  }

  const handleUpgradeClick = () => {
    if (mounted && router) {
      router.push('/plan')
    }
  }

  // クライアントサイドでマウントされていない場合はローディング表示
  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {!mounted ? 'マウント中...' : '返信データ読み込み中...'}
          </p>
        </div>
      </div>
    )
  }

  // メンバーシップデータを取得
  const { membershipType } = membershipData
  console.log('🔴 ReplyClient: レンダリング開始', { membershipType, membershipData })

  return (
    <div>
      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-2 sm:space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('post')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${
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
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${
                activeTab === 'story'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CircleUser className="h-4 w-4" />
              ストーリー
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${
                activeTab === 'live'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Radio className="h-4 w-4" />
              LIVE
            </button>
          </nav>
        </div>
      </div>

      <div className="flex justify-start mb-6">
        {/* 無料会員の場合はアップグレードボタンを表示 */}
        {membershipType === 'FREE' || membershipType === null ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleUpgradeClick}
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
          >
            <PlusIcon className="h-4 w-4" />
            {ReplyService.getRegistrationButtonText(activeTab)}
          </Button>
        )}
      </div>

      <ReplyList
        replies={currentReplies}
        onEdit={handleEdit}
        onDelete={(id: string) => handleDeleteReply(Number(id))}
      />

      <ReplyRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveReplyWithState}
        initialData={editingReply}
        isEditing={isEditing}
        isStoryMode={ReplyService.isStoryMode(activeTab)}
      />
    </div>
  )
}