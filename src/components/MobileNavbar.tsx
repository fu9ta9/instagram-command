"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, MessageSquareMore, CreditCard, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNavbar() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/connect',
      icon: <Instagram className="h-6 w-6" />,
      label: '連携',
    },
    {
      href: '/search',
      icon: <Search className="h-6 w-6" />,
      label: '検索',
    },
    {
      href: '/reply',
      icon: <MessageSquareMore className="h-6 w-6" />,
      label: '返信',
    },
    {
      href: '/plan',
      icon: <CreditCard className="h-6 w-6" />,
      label: 'プラン',
    }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="flex justify-around items-center h-12">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              "transition-colors duration-200",
              pathname === item.href 
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            {item.icon}
            <span className="text-xs mt-0.5">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default MobileNavbar 