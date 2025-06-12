import React, { useState, useEffect } from 'react';
import { Reply, ReplyInput, MATCH_TYPE } from '@/types/reply';
import { Button } from "@/components/ui/button";
import ReplyRegistrationModal from './ReplyRegistrationModal';
import { Pencil, Trash2, ImageIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ReplyListProps {
  replies: Reply[];
  onEdit: (reply: Reply) => void;
  onDelete: (id: string) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, onEdit, onDelete }) => {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaUrls = async () => {
      const uniquePostIds = replies
        .filter(reply => reply.postId)
        .map(reply => reply.postId)
        .filter((id, index, self) => self.indexOf(id) === index);

      // 初期状態でローディング状態を設定
      const initialLoadingState = uniquePostIds.reduce((acc, id) => {
        if (id) acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setLoadingImages(initialLoadingState);
      if (uniquePostIds.length > 0) {
        try {
          const response = await fetch(`/api/instagram/posts/media?post_ids=${uniquePostIds.join(',')}`);
          if (response.ok) {
            const mediaUrls = await response.json();
            setMediaUrls(mediaUrls);
            // ローディング状態を解除
            const completedLoadingState = uniquePostIds.reduce((acc, id) => {
              if (id) acc[id] = false;
              return acc;
            }, {} as Record<string, boolean>);
            setLoadingImages(completedLoadingState);
          }
        } catch (error) {
          console.error('Failed to fetch media URLs:', error);
          setLoadingImages({});
        }
      }
    };

    fetchMediaUrls();
  }, [replies]);

  const handleEdit = (reply: Reply) => {
    setEditingReply(reply);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setReplyToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (replyToDelete) {
      await onDelete(replyToDelete);
      setReplyToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleEditSubmit = async (data: any) => {
    if (editingReply) {
      try {
        const updateData: ReplyInput = {
          keyword: data.keyword,
          reply: data.reply,
          replyType: 2,
          matchType: data.matchType,
          postId: data.postId,
          buttons: data.buttons?.map((button: any, index: number) => ({
            title: button.title,
            url: button.url,
            order: index
          })) || []
        };

        const response = await fetch(`/api/replies/${editingReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            alert('同じキーワードと投稿IDの組み合わせが既に登録されています');
            return;
          }
          throw new Error(errorData.details || errorData.error || '更新に失敗しました');
        }

        const updatedReply = await response.json();
        onEdit(updatedReply);
        setIsEditModalOpen(false);
        setEditingReply(null);
      } catch (error) {
        console.error('更新エラー:', error);
        alert('更新に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <>
      <div className="space-y-4">
        {replies.map((reply) => (
          <div key={reply.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-4">
              {/* SP表示用 */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex-1 min-w-0">
                  <span className="block text-xs text-gray-500">キーワード：</span>
                  <span className="block text-sm text-gray-900 break-words max-w-full">{reply.keyword}</span>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(reply)}
                    variant="outline"
                    size="icon"
                    className="hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(reply.id.toString())}
                    variant="outline"
                    size="icon"
                    className="hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* PC表示用 */}
              <div className="hidden sm:flex sm:justify-between sm:items-start">
                <div className="flex gap-4">
                  {/* ストーリー用の返信（replyType: 2）の場合はサムネイルを表示しない */}
                  {reply.replyType !== 2 && (
                    <div className="w-16 h-16 flex-shrink-0 relative rounded overflow-hidden bg-gray-100">
                      {reply.postId && (
                        loadingImages[reply.postId as string] ? (
                          <Skeleton className="w-full h-full" />
                        ) : mediaUrls[reply.postId] ? (
                          <img
                            src={mediaUrls[reply.postId]}
                            alt="Instagram post"
                            className="object-cover w-full h-full"
                            onLoad={() => {
                              if (reply.postId) {
                                setLoadingImages(prev => ({ ...prev, [reply.postId as string]: false }));
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base">
                      <span className="text-gray-500">キーワード：</span>
                      <span className="text-gray-900 break-words max-w-full">{reply.keyword}</span>
                    </h3>
                    <p className="text-base mt-1 break-words max-w-full">
                      <span className="text-gray-500">返信文：</span>
                      <span className="text-gray-900 line-clamp-2 pl-2 break-words max-w-full">{reply.reply}</span>
                    </p>
                    {reply.buttons && reply.buttons.length > 0 && (
                      <div className="mt-1">
                        <span className="text-gray-500 text-base">ボタンURL：</span>
                        <div className="mt-0.5 space-y-0.5">
                          {reply.buttons.map((button, index) => (
                            <div key={index} className="text-base text-blue-600 truncate pl-2 break-all max-w-full">
                              {button.url}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(reply)}
                    variant="outline"
                    size="icon"
                    className="hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(reply.id.toString())}
                    variant="outline"
                    size="icon"
                    className="hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {editingReply && (
          <ReplyRegistrationModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            initialData={{
              keyword: editingReply.keyword,
              reply: editingReply.reply,
              matchType: editingReply.matchType === 1 ? MATCH_TYPE.EXACT : MATCH_TYPE.PARTIAL,
              postId: editingReply.postId || '',
              buttons: editingReply.buttons?.map(button => ({
                title: button.title,
                url: button.url
              }))
            }}
            isEditing={true}
            isStoryMode={editingReply.replyType === 2}
          />
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>返信を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。この返信は完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReplyList;
