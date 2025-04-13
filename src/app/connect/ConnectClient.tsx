'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import FacebookConnect from '@/components/FacebookConnect'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface InstagramInfo {
  id?: string;
  name?: string;
  profile_picture_url?: string;
}

export default function ConnectClient() {
  const [instagramInfo, setInstagramInfo] = useState<InstagramInfo>({});
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const hasInitialFetch = useRef(false)
  

  // セッションからInstagramの情報を更新
  useEffect(() => {
    if (session?.user?.instagram) {
      setInstagramInfo({
        id: session.user.instagram.id,
        name: session.user.instagram.name,
        profile_picture_url: session.user.instagram.profile_picture_url,
      });
      setIsLoading(false);
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [session, status]);

  // Instagram認証コールバックの処理
  useEffect(() => {
    if (!searchParams) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const message = searchParams.get('message');

    // URLパラメータをクリアするための関数
    const clearUrlParams = () => {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    };

    // エラーメッセージの表示のみ行い、追加のAPIコールは行わない
    if (error) {
      setError(message || 'Instagramとの連携に失敗しました');
      clearUrlParams();
      return;
    }

    // 成功メッセージの表示のみ行い、追加のAPIコールは行わない
    if (success) {
      setSuccess(message || 'Instagramとの連携が完了しました！');
      clearUrlParams();
      return;
    }

    // codeがある場合のみAPIコールを実行（1回のみ）
    if (code) {
      setIsConnecting(true);
      
      fetch(`/api/auth/instagram-callback?code=${code}`, {
        redirect: 'manual' // リダイレクトを手動で処理
      })
        .then(async response => {
          if (response.type === 'opaqueredirect') {
            // リダイレクト先のURLを取得
            const redirectUrl = response.headers.get('Location');
            if (redirectUrl) {
              const url = new URL(redirectUrl);
              // URLパラメータを保持したまま履歴を置き換え
              window.history.replaceState({}, '', url.pathname + url.search);
              // 成功パラメータがある場合は状態を更新
              if (url.searchParams.get('success')) {
                setSuccess('Instagramとの連携が完了しました！');
              }
            }
          } else {
            throw new Error('API request failed');
          }
        })
        .catch(error => {
          console.error('Instagram連携エラー:', error);
          setError('Instagramとの連携中にエラーが発生しました');
        })
        .finally(() => {
          setIsConnecting(false);
        });
    }
  }, [searchParams]);

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
      </div>
    </main>
  );
} 