'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LogoutButton from './LogoutButton'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          キーワード管理
        </Link>
        <div>
          {session ? (
            <>
              <Link href="/dashboard" className="mr-4">
                ダッシュボード
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">
              ログイン
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}