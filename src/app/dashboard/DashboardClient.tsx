'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import ReplyForm from '@/components/ReplyForm'
import ReplyList from '@/components/ReplyList'
import { Reply } from '@/types/reply'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MembershipType } from "@prisma/client"

export default function DashboardClient() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [membershipType, setMembershipType] = useState<MembershipType>('FREE');

  // セッションの状態をログ出力
  console.log('Session status:', status);
  console.log('Session data:', session);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">
      <p>Loading...</p>
    </div>
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button 
            onClick={() => signIn('facebook')} 
            className="mb-4"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'Facebook/Instagram連携'}
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">自動返信一覧</h2>
            <ReplyForm 
              onReplyAdded={() => {}} // 後で実装
              membershipType={membershipType}
            />
          </div>
          <ReplyList 
            replies={replies} 
            onReplyDeleted={() => {}} // 後で実装
            onReplyUpdated={() => {}} // 後で実装
          />
        </div>
      </div>
    </div>
  );
}