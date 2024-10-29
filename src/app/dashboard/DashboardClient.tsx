'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import ReplyForm from '@/components/ReplyForm'
import ReplyList from '@/components/ReplyList'
import { Reply } from '@/types/reply'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession(); // セッション情報を取得
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookConnect = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('facebook', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      if (result?.error) {
        console.error('Facebook連携エラー:', result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Facebook連携エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);
  const fetchReplies = async () => {
    const response = await fetch('/api/replies');
    if (response.ok) {
      const data = await response.json();
      setReplies(data);
    }
  };
  const handleReplyAdded = (data: Omit<Reply, 'id'>) => {
    fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(() => fetchReplies());
  };
  const handleReplyDeleted = async (id: string) => {
    const response = await fetch(`/api/replies/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setReplies(prev => prev.filter(reply => reply.id !== id));
    }
  };
  const handleReplyUpdated = async (id: string, data: Omit<Reply, 'id'>) => {
    const response = await fetch(`/api/replies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      fetchReplies();
    }
  };

  // セッションがまだ取得できていない場合の処理
  if (status === "loading") {
    return <div>Loading...</div>; // ローディング中の表示
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {session?.user?.facebookAccessToken ? ( // Facebook連携済みか確認
            <Button 
              className="mb-4"
              disabled
            >
              Facebook連携済み
            </Button>
          ) : (
            <Button 
              onClick={handleFacebookConnect} 
              className="mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'Facebook/Instagram連携'}
            </Button>
          )}
          {!session?.user?.facebookAccessToken && ( // 再連携リンクを表示
            <p className="text-sm text-gray-500">
              <a 
                href="#" 
                onClick={handleFacebookConnect} 
                className="underline hover:text-blue-600"
              >
                再連携する
              </a>
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">自動返信一覧</h2>
          <ReplyList 
            replies={replies} 
            onReplyDeleted={handleReplyDeleted}
            onReplyUpdated={handleReplyUpdated}
          />
        </div>
      </div>
    </div>
  )
}