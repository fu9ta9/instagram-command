'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { HelpCircle, X } from 'lucide-react'

const MANUAL_PAGES = ['/search', '/plan', '/reply', '/connect']

export default function ManualFloatButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const shouldShow = MANUAL_PAGES.some(page => pathname.startsWith(page))
    setIsVisible(shouldShow)
  }, [pathname])

  const handleManualOpen = () => {
    window.open('/manual', '_blank', 'noopener,noreferrer')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleManualOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 md:w-14 md:h-14 w-12 h-12"
        aria-label="マニュアルを開く"
      >
        {/* アイコン */}
        <HelpCircle className="md:w-6 md:h-6 w-5 h-5" />
        
        {/* ツールチップ（PC用） */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            マニュアルを開く
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>

      </button>

      {/* SP用のラベル（ホバー時表示） */}
      {isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 md:hidden">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
            マニュアル
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}