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
        callbackUrl: '/connect',
        redirect: false,
      });
    } catch (error) {
      console.error('サインインエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <h1 className="text-2xl font-bold mb-4 break-words">Instagram連携</h1>
      <Button onClick={handleConnect} disabled={isLoading} className="w-full min-w-0">
        {isLoading ? 'ログイン中...' : 'Facebookでログイン'}
      </Button>
    </div>
  );
}
