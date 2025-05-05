'use client'

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Session } from 'next-auth'
import { ThemeToggle } from './ThemeToggle'

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
            <ThemeToggle />
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
          </nav>
        </div>
      </div>
    </header>
  )
}