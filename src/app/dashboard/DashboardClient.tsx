'use client'

import { useState, useEffect} from 'react'
import ReplyForm from '@/components/ReplyForm'
import ReplyList from '@/components/ReplyList'
import { Reply, ReplyInput } from '@/types/reply'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MembershipType } from "@prisma/client"
import FacebookConnect from '@/components/FacebookConnect'

export default function DashboardClient() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [membershipType, setMembershipType] = useState<MembershipType>('FREE');

  // セッションの状態をログ出力
  console.log('Session status:', status);
  console.log('Session data:', session);

  // セッション状態の監視とメンバーシップ情報の取得
  useEffect(() => {
    if (session?.user?.id) {
      fetchMembershipType();
      fetchReplies();
    }
  }, [session?.user?.id]);

  // メンバーシップ情報を取得
  const fetchMembershipType = async () => {
    try {
      const response = await fetch(`/api/membership/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMembershipType(data.membershipType);
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  // 返信一覧を取得
  const fetchReplies = async () => {
    try {
      const response = await fetch('/api/replies');
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  // 返信を追加
  const handleReplyAdded = async (newReply: Reply) => {
    try {
      const response = await fetch('/api/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReply),
      });

      if (response.ok) {
        fetchReplies(); // 返信一覧を再取得
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // 返信を削除
  const handleReplyDeleted = async (id: number | string) => {
    const response = await fetch(`/api/replies/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setReplies(prev => prev.filter(reply => reply.id !== id));
    }
  };

  // 返信を更新
  const handleReplyUpdated = async (id: string, data: ReplyInput) => {
    const response = await fetch(`/api/replies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      fetchReplies();
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">
      <p>Loading...</p>
    </div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <FacebookConnect />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">自動返信一覧</h2>
            <ReplyForm 
              onReplyAdded={handleReplyAdded}
              membershipType={membershipType}
            />
          </div>
          <ReplyList 
            replies={replies} 
            onReplyDeleted={handleReplyDeleted}
            onReplyUpdated={handleReplyUpdated}
          />
        </div>
      </div>
    </div>
  );
}