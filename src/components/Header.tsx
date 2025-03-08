'use client'

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <nav className="flex justify-between items-center">
        <div></div> {/* 左側の空白スペース */}
        <div className="flex items-center space-x-2">
          {session ? (
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-gray-700"
            >
              ログアウト
            </Button>
          ) : (
            <Button variant="ghost" asChild className="text-gray-700">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}