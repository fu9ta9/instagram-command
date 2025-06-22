'use client'

import { useState, useEffect, useRef } from 'react'
import FacebookConnect from '@/components/FacebookConnect'
import { Loader2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface InstagramInfo {
  id?: string;
  name?: string;
  profile_picture_url?: string;
}

export default function ConnectClient() {
  const { data: session, status } = useSession();
  const [instagramInfo, setInstagramInfo] = useState<InstagramInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isProcessingParams = useRef(false);
  const router = useRouter();

  // DBからInstagram情報を取得
  useEffect(() => {
    const fetchInstagramInfo = async () => {
      // セッションが確定していない場合は処理をスキップ
      if (status === 'loading' || !session?.user?.id) {
        return;
      }

      try {
        const response = await fetch(`/api/instagram/account?userId=${session.user.id}`);
        const data = await response.json();
        
        if (response.ok && data.account) {
          setInstagramInfo({
            id: data.account.id,
            name: data.account.username,
            profile_picture_url: data.account.profilePictureUrl,
          });
        }
      } catch (error) {
        console.error('Instagram情報取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // セッションが確定してからのみ実行
    if (status !== 'loading' && session?.user?.id) {
      fetchInstagramInfo();
    } else if (status !== 'loading') {
      // セッションがないが読み込み完了の場合
      setIsLoading(false);
    }
  }, [session?.user?.id]); // statusを依存配列から削除して不要な再実行を防ぐ

  // Instagram認証コールバックの処理
  useEffect(() => {
    if (!searchParams || isProcessingParams.current || status === 'loading' || !session?.user?.id) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    const instagram = searchParams.get('instagram');

    // パラメータが存在する場合のみ処理を実行
    if (error || success || code) {
      isProcessingParams.current = true;
    } else {
      return;
    }

    if (error) {
      setError(message || 'Instagramとの連携に失敗しました');
      router.replace('/connect');
      return;
    }

    if (success && instagram) {
      try {
        const instagramData = JSON.parse(decodeURIComponent(instagram));
        setInstagramInfo({
          id: instagramData.id,
          name: instagramData.username,
          profile_picture_url: instagramData.profile_picture_url
        });
        setSuccess(message || 'Instagramとの連携が完了しました！');
        router.push('/connect');
      } catch (error) {
        console.error('Instagram情報パースエラー:', error);
        setError('Instagram情報の処理中にエラーが発生しました');
        router.replace('/connect');
      }
      return;
    }

    if (code) {
      setIsConnecting(true);
      
      fetch(`/api/auth/instagram-callback?code=${code}`, {
        redirect: 'manual'
      })
        .then(async response => {
          if (response.type === 'opaqueredirect') {
            const redirectUrl = response.headers.get('Location');
            if (redirectUrl) {
              const url = new URL(redirectUrl);
              router.replace(url.pathname + url.search);
            }
          } else {
            throw new Error('API request failed');
          }
        })
        .catch(error => {
          console.error('Instagram連携エラー:', error);
          setError('Instagramとの連携中にエラーが発生しました');
          router.replace('/connect');
        })
        .finally(() => {
          setIsConnecting(false);
        });
    }
  }, [searchParams, status, session?.user?.id, router]);

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/instagram/connect', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Instagram連携に失敗しました')
      }
      
      setSuccess('Instagramとの連携が完了しました！')
    } catch (error) {
      console.error('Instagram連携エラー:', error);
      setError('Instagramとの連携に失敗しました')
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Instagram連携</h1>
        <div className="w-full min-w-0 max-w-full p-4 min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-gray-600 dark:text-gray-300">ローディング中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Instagram連携</h1>
      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden overflow-auto">
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded">
              {success}
            </div>
          )}

          {instagramInfo.id ? (
            <div className="space-y-4">
              <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-2 rounded">
                <span className="mr-2">Instagram連携済み</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                {instagramInfo.profile_picture_url && (
                  <img 
                    src={instagramInfo.profile_picture_url} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="font-medium dark:text-gray-200">{instagramInfo.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">ID: {instagramInfo.id}</div>
                </div>
              </div>
              <div className="mt-4">
                <FacebookConnect isReconnect={true} />
              </div>
            </div>
          ) : (
              <FacebookConnect />
          )}
        </div>
      </main>
    </div>
  );
} 