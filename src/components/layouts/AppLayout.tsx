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
        {/* メインコンテンツエリア - マージンを修正 */}
        <div className="flex-1 w-full">
          {/* ヘッダー - モバイルのみ表示 */}
          <header className="md:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-lg font-semibold">InstagramDM</h1>
          </header>
          
          {/* メインコンテンツ */}
          <main className="p-4 md:p-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
        
        {/* モバイル用フッターナビゲーション */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
    </SidebarProvider>
  )
} 