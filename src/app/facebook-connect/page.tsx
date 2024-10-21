'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FacebookConnectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('facebook', { 
        callbackUrl: '/dashboard',
        redirect: false
      })
      if (result?.error) {
        console.error('サインインエラー:', result.error)
        // エラーが発生してもダッシュボードにリダイレクト
        router.push('/dashboard')
      } else if (result?.url) {
        router.push('/dashboard')
      } else {
        console.error('予期せぬ結果:', result)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('サインインエラー:', error)
      // エラーが発生してもダッシュボードにリダイレクト
      router.push('/dashboard')
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Facebook/Instagram連携</h1>
      <Button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? 'ログイン中...' : 'Facebookでログイン'}
      </Button>
    </div>
  ) 
}
