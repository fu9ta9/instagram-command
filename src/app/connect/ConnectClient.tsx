'use client'

import { useState, useEffect } from 'react'
import FacebookConnect from '@/components/FacebookConnect'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useInstagram } from '@/contexts/InstagramContext'
import { useSearchParams } from 'next/navigation'

interface ConnectionStatus {
  instagram: {
    connected: boolean;
    name?: string;
    id?: string;
    profile_picture_url?: string;
  };
}

export default function ConnectClient() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    instagram: { connected: false }
  });
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  // Instagramコンテキストを使用
  const { updateStatus } = useInstagram()

  // デバッグログ: セッション状態
  useEffect(() => {
    console.log('Session Status:', {
      status,
      userId: session?.user?.id,
      instagramConnected: session?.user?.instagram?.connected
    });
  }, [session, status]);

  // 連携状態を取得
  const fetchConnectionStatus = async () => {
    console.log('Fetching connection status...');
    try {
      const response = await fetch('/api/connections/status');
      console.log('Status API Response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connection Status Data:', data);
        setConnectionStatus({
          instagram: data.instagram
        });
      } else {
        console.error('Status API Error:', await response.text());
      }
    } catch (error) {
      console.error('Connection Status Error:', error);
    } finally {
      setIsLoading(false)
    }
  };

  // Instagram認証コールバックの処理
  useEffect(() => {
    if (!searchParams) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    console.log('Callback Parameters:', { code, error, success });

    if (code) {
      setIsConnecting(true);
      console.log('Initiating Instagram callback with code...');
      
      fetch(`/api/auth/instagram-callback?code=${code}`)
        .then(async response => {
          console.log('Instagram Callback Response:', response.status);
          const responseText = await response.text();
          console.log('Instagram Callback Response Text:', responseText);
          
          if (response.ok) {
            setSuccess('Instagramとの連携が完了しました！');
            updateStatus();
          } else {
            setError('Instagramとの連携に失敗しました');
            console.error('Instagram Callback Error:', responseText);
          }
        })
        .catch(error => {
          console.error('Instagram Callback Error:', error);
          setError('Instagramとの連携中にエラーが発生しました');
        })
        .finally(() => {
          setIsConnecting(false);
        });
    }

    if (error) {
      console.error('Instagram Error Parameter:', error);
      setError('Instagramとの連携に失敗しました');
    }

    if (success) {
      console.log('Instagram Success Parameter:', success);
      setSuccess('Instagramとの連携が完了しました！');
      updateStatus();
    }
  }, [searchParams, updateStatus]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Session authenticated, checking Instagram connection...');
      // セッションのinstagram.connectedがtrueの場合のみAPIを呼び出す
      if (session.user.instagram?.connected) {
        console.log('Instagram is connected, fetching status...');
        fetchConnectionStatus();
      } else {
        console.log('Instagram is not connected, setting default state...');
        // 未連携の場合は直接状態を設定
        setConnectionStatus({
          instagram: { connected: false }
        });
        setIsLoading(false);
      }
    }
  }, [status, session?.user?.id, session?.user?.instagram?.connected]);

  const handleConnect = async () => {
    console.log('Initiating Instagram connection...');
    setIsConnecting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/instagram/connect', {
        method: 'POST'
      })
      
      console.log('Connect API Response:', response.status);
      const data = await response.json()
      console.log('Connect API Data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Instagram連携に失敗しました')
      }
      
      // 連携成功時にInstagram状態を更新
      await updateStatus()
      
      setSuccess('Instagramとの連携が完了しました！')
    } catch (error) {
      console.error('Connect Error:', error);
      setError('Instagramとの連携に失敗しました')
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Instagram連携状態</h2>
          
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

          {connectionStatus.instagram.connected ? (
            <div className="space-y-4">
              <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-2 rounded">
                <span className="mr-2">Instagram連携済み</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                {connectionStatus.instagram.profile_picture_url && (
                  <img 
                    src={connectionStatus.instagram.profile_picture_url} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="font-medium dark:text-gray-200">{connectionStatus.instagram.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">ID: {connectionStatus.instagram.id}</div>
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
      </div>
    </main>
  );
} 