import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          {children}
          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Acme Inc. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link 
                className="text-xs hover:underline underline-offset-4" 
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
              >
                利用規約
              </Link>
              <Link 
                className="text-xs hover:underline underline-offset-4" 
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                プライバシーポリシー
              </Link>
              <Link 
                className="text-xs hover:underline underline-offset-4" 
                href="/legal"
                target="_blank"
                rel="noopener noreferrer"
              >
                特定商取引法に基づく表記
              </Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  )
}