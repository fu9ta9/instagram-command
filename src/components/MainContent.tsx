'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn(
      "flex-1 flex flex-col transition-[margin] duration-300",
      "bg-gray-50 text-gray-900 w-full min-w-0 max-w-full overflow-x-hidden",
      "ml-0 md:ml-[var(--sidebar-width)]",
      {
        "md:ml-16": isCollapsed,
        "md:ml-56": !isCollapsed
      }
    )}>
      {children}
    </div>
  )
} 