'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Menu, X } from 'lucide-react'

export default function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
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

  // ダッシュボード画面以降でのみ表示
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/upgrade')) {
    return null
  }

  return (
    <>
      <button
        className={`fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md transition-all duration-300 ${isOpen ? 'left-64' : 'left-4'}`}
        onClick={toggleSidebar}
        aria-label="サイドバーを切り替え"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'}`}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        <div className="h-full px-3 py-4 overflow-hidden bg-gray-50 dark:bg-gray-800">
          <nav className="space-y-2 font-medium mt-12">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                  hover:bg-gray-100 dark:hover:bg-gray-700 group
                  ${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700' : ''}
                `}
              >
                <item.icon className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}