'use client'

import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn('google', {
      callbackUrl: '/dashboard'
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Googleでログイン
      </button>
    </div>
  )
}
