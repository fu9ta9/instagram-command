'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function FacebookConnectPage() {
  const handleConnect = async () => {
    try {
      await signIn('facebook', { callbackUrl: '/dashboard' })
      // const result = await signIn('facebook', { 
      //   callbackUrl: '/dashboard',
      //   redirect: false
      // })
      // if (result?.error) {
      // } else if (result?.url) {
      //   window.location.href = result.url
      // }
    } catch (error) {
      console.error('SignIn error:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Facebook/Instagram連携</h1>
      <Button onClick={handleConnect}>Facebookでログイン</Button>
    </div>
  )
}