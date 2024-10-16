'use client'

import { ReactNode } from 'react'
import ResponsiveSidebar from './ResponsiveSidebar'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex">
      <ResponsiveSidebar />
      <main className="flex-1 transition-all duration-300 ml-16 p-8">
        {children}
      </main>
    </div>
  )
}