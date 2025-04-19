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
  console.log('1. ConnectClient コンポーネントがレンダリング');
  
  const [instagramInfo, setInstagramInfo] = useState<InstagramInfo>({});
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const hasInitialFetch = useRef(false)
  const [isUpdatingSession, setIsUpdatingSession] = useState(false)

  // セッションからInstagramの情報を更新
  useEffect(() => {
    console.log('2. セッション更新useEffect実行', { 
      hasInstagram: !!session?.user?.instagram,
      status,
      isUpdatingSession
    });

    if (status === 'loading') return;

    if (session?.user?.instagram && !isUpdatingSession) {
      console.log('2-1. Instagramセッション情報を設定');
      setInstagramInfo({
        id: session.user.instagram.id,
        name: session.user.instagram.name,
        profile_picture_url: session.user.instagram.profile_picture_url,
      });
    }
    setIsLoading(false);
  }, [session, status, isUpdatingSession]);

  // Instagram認証コールバックの処理
  useEffect(() => {
    if (!searchParams || isUpdatingSession) return;

    console.log('3. コールバック処理useEffect実行', {
      hasSearchParams: !!searchParams,
      params: {
        code: searchParams?.get('code'),
        error: searchParams?.get('error'),
        success: searchParams?.get('success'),
        instagram: searchParams?.get('instagram'),
      }
    });

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    const instagram = searchParams.get('instagram');

    // URLパラメータをクリアするための関数
    const clearUrlParams = () => {
      console.log('3-1. URLパラメータをクリア');
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    };

    // エラーメッセージの表示のみ行い、追加のAPIコールは行わない
    if (error) {
      console.log('3-2. エラー処理');
      setError(message || 'Instagramとの連携に失敗しました');
      clearUrlParams();
      return;
    }

    // 成功メッセージの表示とInstagram情報の更新
    if (success && instagram) {
      try {
        const instagramData = JSON.parse(decodeURIComponent(instagram));
        console.log('3-4. Instagram データをパース', instagramData);
        
        setInstagramInfo({
          id: instagramData.id,
          name: instagramData.username,
          profile_picture_url: instagramData.profile_picture_url
        });
        setSuccess(message || 'Instagramとの連携が完了しました！');
      } catch (error) {
        console.error('3-6. Instagram情報パースエラー:', error);
        setError('Instagram情報の処理中にエラーが発生しました');
      }
      clearUrlParams();
      return;
    }

    // codeがある場合のみAPIコールを実行
    if (code) {
      console.log('3-8. 認証コードによるAPI呼び出し開始');
      setIsConnecting(true);
      
      fetch(`/api/auth/instagram-callback?code=${code}`, {
        redirect: 'manual'
      })
        .then(async response => {
          console.log('3-9. API呼び出し完了', { responseType: response.type });
          if (response.type === 'opaqueredirect') {
            const redirectUrl = response.headers.get('Location');
            if (redirectUrl) {
              const url = new URL(redirectUrl);
              window.history.replaceState({}, '', url.pathname + url.search);
              if (url.searchParams.get('success')) {
                setSuccess('Instagramとの連携が完了しました！');
              }
            }
          } else {
            throw new Error('API request failed');
          }
        })
        .catch(error => {
          console.error('3-10. Instagram連携エラー:', error);
          setError('Instagramとの連携中にエラーが発生しました');
        })
        .finally(() => {
          console.log('3-11. API呼び出し処理完了');
          setIsConnecting(false);
        });
    }
  }, [searchParams, isUpdatingSession]);

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

  if (isLoading || isUpdatingSession) {
    console.log('4. ローディング表示');
    return (
      <div className="container mx-auto p-4 min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {isUpdatingSession ? 'セッション情報を更新中...' : 'ローディング中...'}
          </p>
        </div>
      </div>
    )
  }

  console.log('5. メイン画面表示', { instagramInfo, error, success });
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