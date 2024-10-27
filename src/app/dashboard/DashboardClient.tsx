'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookConnect = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('facebook', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      if (result?.error) {
        console.error('Facebook連携エラー:', result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Facebook連携エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button 
            onClick={handleFacebookConnect} 
            className="mb-4"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'Facebook/Instagram連携'}
          </Button>
        </div>
        {/* 他のダッシュボードコンテンツはここに追加 */}
      </div>
    </div>
  )
}
