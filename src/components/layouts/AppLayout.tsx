import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNavbar from '@/components/MobileNavbar'
import { SidebarProvider } from '@/contexts/SidebarContext'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">        
        {/* メインコンテンツエリア*/}
        <div className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
          <MobileNavbar />
        </div>
      </div>
    </SidebarProvider>
  )
} 