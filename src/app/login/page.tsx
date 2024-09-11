'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false
      })
      if (result?.error) {
        console.error('SignIn error:', result.error)
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('SignIn error:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">ログイン</h1>
        <Button 
          className="w-full" 
          onClick={handleGoogleSignIn}
        >
          Googleでログイン
        </Button>
      </div>
    </div>
  )
}