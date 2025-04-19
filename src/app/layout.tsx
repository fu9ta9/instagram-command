import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/AuthProvider'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { MainContent } from '@/components/MainContent'
import { getSession } from '@/lib/session'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // サーバーサイドでセッションを取得
  const session = await getSession()

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-gray-50")}>
        <AuthProvider>
          <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar session={session} />
              <MainContent>
                <Header session={session} />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </MainContent>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}