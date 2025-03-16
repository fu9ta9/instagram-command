import React, { useState, useEffect } from 'react';
import { Reply, ReplyInput, MATCH_TYPE } from '@/types/reply';
import { Button } from "@/components/ui/button";
import ReplyRegistrationModal from './ReplyRegistrationModal';
import { Pencil, Trash2 } from 'lucide-react';
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

interface ReplyListProps {
  replies: Reply[];
  onEdit: (reply: Reply) => void;
  onDelete: (id: string) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, onEdit, onDelete }) => {
  // 投稿IDとメディアURLのマッピング
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

  // 投稿のメディアURLを取得
  useEffect(() => {
    const fetchMediaUrls = async () => {
      const newMediaUrls: Record<string, string> = {};
      
      for (const reply of replies) {
        if (reply.postId) {
          try {
            const response = await fetch(`/api/instagram/posts/${reply.postId}/media`);
            if (response.ok) {
              const data = await response.json();
              newMediaUrls[reply.postId] = data.media_url || data.thumbnail_url;
            }
          } catch (error) {
            console.error(`Failed to fetch media for post ${reply.postId}:`, error);
          }
        }
      }
      
      setMediaUrls(newMediaUrls);
    };

    fetchMediaUrls();
  }, [replies]);

  const handleEdit = (reply: Reply) => {
    onEdit(reply);
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
    console.log('handleEditSubmit', data);
    if (editingReply) {
      try {
        // データを適切な形式に変換
        const updateData: ReplyInput = {
          keyword: data.keyword,
          reply: data.reply,
          replyType: 2, // デフォルト値
          matchType: data.matchType,
          postId: data.postId,
          buttons: data.buttons?.map((button: any, index: number) => ({
            title: button.title,
            url: button.url,
            order: index
          })) || []
        };

        // PUT APIを呼び出して更新
        const response = await fetch(`/api/replies/${editingReply.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // 409エラー（重複）の場合
          if (response.status === 409) {
            alert('同じキーワードと投稿IDの組み合わせが既に登録されています');
            return; // 処理を中断
          }
          
          throw new Error(errorData.details || errorData.error || '更新に失敗しました');
        }

        const updatedReply = await response.json();
        
        // 投稿IDが変更された場合、新しい投稿の画像URLを取得
        if (updatedReply.postId !== editingReply.postId) {
          try {
            const mediaResponse = await fetch(`/api/instagram/posts/${updatedReply.postId}/media`);
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              setMediaUrls(prev => ({
                ...prev,
                [updatedReply.postId]: mediaData.media_url || mediaData.thumbnail_url
              }));
            }
          } catch (error) {
            console.error('Error fetching new media URL:', error);
          }
        }
        
        // 親コンポーネントの更新関数を呼び出し
        onEdit(updatedReply);
        
        // モーダルを閉じる
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
          <div key={reply.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* 投稿画像の表示 */}
                {reply.postId && mediaUrls[reply.postId] && (
                  <div className="w-20 h-20 relative">
                    <img
                      src={mediaUrls[reply.postId]}
                      alt="Instagram post"
                      className="object-cover w-full h-full rounded"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">キーワード: {reply.keyword}</h3>
                  <p className="text-gray-600 mt-1">返信: {reply.reply}</p>
                  {reply.buttons && reply.buttons.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">ボタン:</p>
                      {reply.buttons.map((button, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {button.title} - {button.url}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEdit(reply)}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteClick(reply.id.toString())}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
