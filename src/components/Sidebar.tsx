"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Instagram, MessageSquareMore, CreditCard, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useInstagram } from '@/contexts/InstagramContext'

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { status, isLoading } = useInstagram()
  const pathname = usePathname()
  const { data: session } = useSession()

  const sidebarItems = [
    {
      href: '/connect',
      label: 'Instagram連携',
      icon: <Instagram className="h-5 w-5" />,
      requiresAuth: true,
    },
    {
      href: '/search',
      label: 'アカウント検索',
      icon: <Search className="h-5 w-5" />,
      requiresAuth: true,
    },
    {
      href: '/reply',
      label: 'DM自動返信設定',
      icon: <MessageSquareMore className="h-5 w-5" />,
      requiresAuth: true,
    },
    {
      href: '/plan',
      label: 'プラン設定',
      icon: <CreditCard className="h-5 w-5" />,
      requiresAuth: true,
    }
  ]

  // 認証状態に基づいてフィルタリング
  const filteredItems = sidebarItems.filter(item => 
    !item.requiresAuth || (item.requiresAuth && session)
  )

  return (
    <aside className={cn(
      "flex flex-col h-screen fixed top-0 left-0 z-20",
      "transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-56",
      "bg-gradient-to-b from-blue-800 to-blue-900 text-gray-100 border-r border-blue-950",
      "hidden md:flex" // モバイルでは非表示、デスクトップでは表示
    )}>
      <div className="flex items-center justify-end p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-blue-700/50 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg",
                  "transition-all duration-200 ease-in-out",
                  pathname === item.href 
                    ? "bg-white/10 text-white"
                    : "text-blue-100 hover:bg-blue-700/50",
                  isCollapsed && "justify-center"
                )}
              >
                {item.icon}
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar;