'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const router = useRouter();

  const handleFacebookConnect = () => {
    router.push('/facebook-connect');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">自動返信管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Button onClick={handleFacebookConnect} className="mb-4">Facebook/Instagram連携</Button>
        </div>
        {/* 他のダッシュボードコンテンツはここに追加 */}
      </div>
    </div>
  )
}
