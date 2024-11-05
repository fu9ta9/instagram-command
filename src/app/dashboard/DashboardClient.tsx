'use client'

import { useState, useEffect } from 'react'
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
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('Unauthenticated, redirecting to login...');
      router.push('/login');
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [membershipType, setMembershipType] = useState<MembershipType>('FREE');

  useEffect(() => {
    console.log('Session Debug Info:', {
      status, // 'loading' | 'authenticated' | 'unauthenticated'
      sessionExists: !!session,
      userData: {
        id: session?.user?.id,
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
        facebookAccessToken: session?.user?.facebookAccessToken,
      },
      fullSession: session, // セッションの完全な内容
    });
  }, [session, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Membership Debug:', {
        currentMembershipType: membershipType,
        userId: session?.user?.id,
        isAuthenticated: true,
      });
      fetchMembershipType();
    }
  }, [status, session?.user?.id]);

  const fetchMembershipType = async () => {
    if (!session?.user?.id) {
      console.log('Membership Fetch Error: No user ID available');
      return;
    }

    try {
      console.log('Fetching membership for user:', session.user.id);
      const response = await fetch(`/api/membership/${session.user.id}`);
      
      console.log('Membership API Response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Membership Data Received:', data);
        setMembershipType(data.membershipType || 'FREE');
      } else {
        const errorData = await response.json();
        console.error('Membership Fetch Failed:', errorData);
      }
    } catch (error) {
      console.error('Membership Fetch Error:', error);
    }
  };

  const handleFacebookConnect = async () => {
    setIsLoading(true);
    console.log('Starting Facebook Connect...', {
      sessionStatus: status,
      userId: session?.user?.id,
    });

    try {
      const result = await signIn('facebook', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      console.log('Facebook Connect Result:', result);

      if (result?.error) {
        console.error('Facebook Connect Error:', result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Facebook Connect Exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch('/api/replies');
      if (response.status === 401) {
        console.log('認証が必要です');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      } else {
        console.error('返信の取得に失敗:', await response.json());
      }
    } catch (error) {
      console.error('返信の取得エラー:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchReplies();
    }
  }, [session?.user?.id]);

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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          
          {session?.user?.facebookAccessToken ? (
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
          {!session?.user?.facebookAccessToken && (
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
  )
}