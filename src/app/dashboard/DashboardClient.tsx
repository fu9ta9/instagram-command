'use client'

import { useState, useEffect } from 'react'
import ReplyForm from '@/components/ReplyForm'
import ReplyList from '@/components/ReplyList'
import { Reply } from '@/types/reply'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const router = useRouter();

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

  const handleReplyDeleted = async (id: number) => {
    const response = await fetch(`/api/replies/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setReplies(prev => prev.filter(reply => reply.id !== id));
    }
  };

  const handleReplyUpdated = async (id: number, data: Omit<Reply, 'id'>) => {
    const response = await fetch(`/api/replies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      fetchReplies();
    }
  };

  const handleFacebookConnect = () => {
    router.push('/facebook-connect');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button onClick={handleFacebookConnect} className="mb-4">Facebook/Instagram連携</Button>
          {/* <ReplyForm onReplyAdded={handleReplyAdded} /> */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">自動返信一覧</h2>
          {/* <ReplyList 
            replies={replies} 
            onReplyDeleted={handleReplyDeleted}
            onReplyUpdated={handleReplyUpdated}
          /> */}
        </div>
      </div>
    </div>
  )
}
