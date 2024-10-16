'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function FacebookConnectPage() {
  const router = useRouter();

  const handleConnect = async () => {
    try {
      const result = await signIn('facebook', { 
        callbackUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
        redirect: false
      })
      if (result?.error) {
        console.error('サインインエラー:', result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error('サインインエラー:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Facebook/Instagram連携</h1>
      <Button onClick={handleConnect}>Facebookでログイン</Button>
    </div>
  ) 
}
