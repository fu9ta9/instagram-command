'use client'

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Session } from 'next-auth'
import { LogIn, LogOut } from 'lucide-react'

type HeaderProps = {
  session: Session | null
}

export default function Header({ session }: HeaderProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center w-full md:container md:max-w-screen-2xl">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1" />
          <nav className="flex items-center space-x-2">
            {session ? (
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-700 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </Button>
            ) : (
              <Button variant="ghost" asChild className="text-gray-700 flex items-center gap-1">
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  ログイン
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}