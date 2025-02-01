'use client'

import { useState, useEffect} from 'react'
import ReplyForm from '@/components/ReplyForm'
import ReplyList from '@/components/ReplyList'
import { Reply, ReplyInput } from '@/types/reply'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MembershipType } from "@prisma/client"
import FacebookConnect from '@/components/FacebookConnect'
import Sidebar from '@/components/Sidebar'

interface ConnectionStatus {
  facebook: {
    connected: boolean;
    name?: string;
    id?: string;
    instagramId?: string;
    profile_picture_url?: string;
  };
  instagram: {
    connected: boolean;
    name?: string;
    id?: string;
    profile_picture_url?: string;
  };
}

export default function DashboardClient() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    facebook: { connected: false },
    instagram: { connected: false }
  });
  const router = useRouter();
  const { data: session, status } = useSession();
  const [membershipType, setMembershipType] = useState<MembershipType>('FREE');

  // 連携状態を取得
  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/connections/status');
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      }
    } catch (error) {
      console.error('連携状態の取得に失敗:', error);
    }
  };

  useEffect(() => {
    // セッションがロード完了し、ユーザーが認証済みの場合
    if (status === 'authenticated' && session?.user?.id) {
      fetchMembershipType();
      fetchReplies();
      fetchConnectionStatus();
    }
  }, [status, session?.user?.id]);

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

  // if (status === 'loading') {
  //   return <div className="flex justify-center items-center min-h-screen">
  //     <p>Loading...</p>
  //   </div>
  // }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">連携状態</h2>
            {connectionStatus.facebook.connected ? (
              <div className="space-y-4">
                <div className="inline-flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                  <span className="mr-2">Instagram連携済み</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                {connectionStatus.instagram.connected && (
                  <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded">
                    {connectionStatus.instagram.profile_picture_url && (
                      <img 
                        src={connectionStatus.instagram.profile_picture_url} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{connectionStatus.instagram.name}</div>
                      <div className="text-gray-500">ID: {connectionStatus.instagram.id}</div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <a
                    href={`https://www.facebook.com/v22.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI}&scope=instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,pages_manage_metadata&state=${session?.user?.id}`}
                    className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    Instagram再連携
                  </a>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  ※ 連携に問題がある場合は再連携を試してください
                </div>
              </div>
            ) : (
              <FacebookConnect />
            )}
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">自動返信一覧</h2>
              <ReplyForm 
                onReplyAdded={handleReplyAdded}
                membershipType={membershipType}
                onReplyRegistered={fetchReplies}
              />
            </div>
            <ReplyList 
              replies={replies} 
              onReplyDeleted={handleReplyDeleted}
              onReplyUpdated={handleReplyUpdated}
            />
          </div>
        </div>
      </main>
    </div>
  );
}