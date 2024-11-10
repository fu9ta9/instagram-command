import React, { useState, useEffect } from 'react';
import { Reply } from '@/types/reply';
import { Button } from "@/components/ui/button";
import { ReplyInput } from '@/types/reply';

interface ReplyListProps {
  replies: Reply[];
  onReplyDeleted: (id: string) => void;
  onReplyUpdated: (id: string, data: ReplyInput) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, onReplyDeleted, onReplyUpdated }) => {
  // 投稿IDとメディアURLのマッピング
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

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
            console.error(`Error fetching media URL for post ${reply.postId}:`, error);
          }
        }
      }
      
      setMediaUrls(newMediaUrls);
    };

    fetchMediaUrls();
  }, [replies]);

  const handleDelete = async (id: string) => {
    if (window.confirm('この返信を削除してもよろしいですか？')) {
      await onReplyDeleted(id);
    }
  };

  const handleEdit = async (reply: Reply) => {
    // 編集用のデータを準備
    const editData: ReplyInput = {
      keyword: reply.keyword,
      reply: reply.reply,
      postId: reply.postId,
      replyType: reply.replyType,
      matchType: reply.matchType,
      buttons: reply.buttons?.map(button => ({
        title: button.title,
        url: button.url,
        order: button.order
      }))
    };
    
    await onReplyUpdated(reply.id.toString(), editData);
  };

  return (
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
                size="sm"
              >
                編集
              </Button>
              <Button
                onClick={() => handleDelete(reply.id.toString())}
                variant="destructive"
                size="sm"
              >
                削除
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReplyList;
