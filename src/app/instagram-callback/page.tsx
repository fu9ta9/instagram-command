'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function InstagramCallback() {
  const router = useRouter();
  const { update: updateSession } = useSession();

  useEffect(() => {
    // URLパラメータを一度だけ取得
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // エラーハンドリング
    if (error) {
      console.error('❌ Instagram auth error:', error, errorDescription);
      router.push(`/connect?error=instagram_auth_failed&message=${encodeURIComponent(errorDescription || '認証に失敗しました')}`);
      return;
    }

    if (!code) {
      console.error('❌ No authorization code provided');
      router.push(`/connect?error=no_code&message=${encodeURIComponent('認証コードが提供されていません')}`);
      return;
    }

    // API呼び出しとセッション更新
    const handleCallback = async () => {
      try {
        const response = await fetch(`/api/auth/instagram-callback?code=${code}`, {
          redirect: 'manual'
        });

        if (response.type === 'opaqueredirect') {
          await updateSession();

          const redirectUrl = response.headers.get('Location');
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/connect');
          }
          return;
        }
        router.push('/connect?error=unknown&message=予期せぬエラーが発生しました');
      } catch (error) {
        console.error('❌ API request failed:', error);
        router.push(`/connect?error=api_error&message=${encodeURIComponent('認証処理中にエラーが発生しました')}`);
      }
    };

    handleCallback();
  }, []); // 依存配列を空にして初期表示時のみ実行

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Instagram認証</h1>
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">認証処理中です...</p>
        </div>
      </div>
    </div>
  );
}