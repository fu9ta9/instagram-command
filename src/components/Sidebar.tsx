"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wifi, MessageSquare, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { name: 'Connection Status', href: '/connection', icon: Wifi },
  { name: 'Reply Settings', href: '/reply', icon: MessageSquare },
  { name: 'Payment', href: '/payment', icon: CreditCard },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200",
      "transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64",
      "border-r border-gray-200 dark:border-gray-700"
    )}>
      <div className="flex items-center justify-end p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg",
                  "transition-all duration-200 ease-in-out",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  pathname === item.href && "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon size={24} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar;