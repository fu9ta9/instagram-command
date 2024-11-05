'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      })
      
      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>
        Googleでログイン
      </button>
    </div>
  )
}
