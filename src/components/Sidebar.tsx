'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, CreditCard, LogOut, Menu, X } from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  // const { data: session } = useSession()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsOpen(!mobile)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const navItems = [
    { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
    { name: '決済', href: '/upgrade', icon: CreditCard },
  ]

  return (
    <>
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : (isMobile ? 'w-0' : 'w-16')}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="h-full px-3 py-4 overflow-hidden bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-xl font-semibold text-gray-800 dark:text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              キーワード管理
            </h1>
            {(!isMobile || isOpen) && (
              <button
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                    hover:bg-gray-100 dark:hover:bg-gray-700 group
                    ${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          {(
            <button
              onClick={() => signOut()}
              className={`flex items-center p-2 mt-auto text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 group absolute bottom-4 ${isOpen ? 'left-3 right-3' : 'left-1/2 -translate-x-1/2'}`}
            >
              <LogOut className="w-5 h-5 transition duration-75 group-hover:text-red-900 dark:group-hover:text-white" />
              <span className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>ログアウト</span>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}