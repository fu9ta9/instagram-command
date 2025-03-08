import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Link from 'next/link'
import { AuthProvider } from '@/components/AuthProvider'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { InstagramProvider } from '@/contexts/InstagramContext'
import { MainContent } from '@/components/MainContent'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-gray-50")}>
        <AuthProvider>
          <InstagramProvider>
            <SidebarProvider>
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <MainContent>
                  <Header />
                  <main className="flex-1 p-6">
                    {children}
                  </main>
                </MainContent>
              </div>
            </SidebarProvider>
          </InstagramProvider>
        </AuthProvider>
      </body>
    </html>
  )
}