'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import KeywordForm from '@/components/KeywordForm'
import KeywordList from '@/components/KeywordList'
import { Button } from "@/components/ui/button"
import InstagramThumbnails from '@/components/InstagramThumbnails'

export default function DashboardClient() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isInstagramConnected, setIsInstagramConnected] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()


  useEffect(() => {
    if (session?.accessToken) {
      setIsInstagramConnected(true)
    }
  }, [session])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleKeywordChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleInstagramConnect = () => {
    router.push('/facebook-connect')
  }

  return (
    // <div className="container mx-auto p-4 max-w-4xl">
    //   <h1 className="text-3xl font-bold mb-8 text-center">キーワード管理ダッシュボード</h1>
    //   <div className="mb-8">
    //     {isInstagramConnected ? (
    //       <InstagramThumbnails />
    //     ) : (
    //       <Button onClick={handleInstagramConnect}>Instagram連携</Button>
    //     )}
    //   </div>
    <div className="container mx-auto p-4 max-w-4xl">
    <h1 className="text-3xl font-bold mb-8 text-center">キーワード管理ダッシュボード</h1>
    <div className="mb-8">
      <p>Facebookで認証済み</p>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">キーワード登録</h2>
          <KeywordForm onKeywordAdded={handleKeywordChange} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">登録済みキーワード</h2>
          <KeywordList key={refreshKey} onKeywordDeleted={handleKeywordChange} />
        </div>
      </div>
    </div>
  )
}