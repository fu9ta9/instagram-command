'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface InstagramStatus {
  instagram?: {
    connected: boolean
    username?: string
    profilePictureUrl?: string
  }
}

interface InstagramContextType {
  status: InstagramStatus | null
  isLoading: boolean
  updateStatus: () => Promise<void>
  setStatus: (status: InstagramStatus) => void
}

const InstagramContext = createContext<InstagramContextType>({
  status: null,
  isLoading: true,
  updateStatus: async () => {},
  setStatus: () => {}
})

export function InstagramProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<InstagramStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/connections/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        localStorage.setItem('instagramStatus', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to fetch Instagram status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // ローカルストレージから以前のステータスを取得
    const savedStatus = localStorage.getItem('instagramStatus')
    if (savedStatus) {
      try {
        setStatus(JSON.parse(savedStatus))
        setIsLoading(false)
      } catch (e) {
        console.error('Failed to parse saved status:', e)
      }
    }
    
    // 最新のステータスを取得
    updateStatus()
    
    // 定期的に更新（5分ごと）
    const intervalId = setInterval(updateStatus, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  return (
    <InstagramContext.Provider value={{ status, isLoading, updateStatus, setStatus }}>
      {children}
    </InstagramContext.Provider>
  )
}

export const useInstagram = () => useContext(InstagramContext) 