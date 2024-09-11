'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface InstagramMediaItem {
  id: string
  media_type: string
  media_url: string
  thumbnail_url?: string
}

export default function InstagramThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchThumbnails()
  }, [])

  const fetchThumbnails = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get<{ data: InstagramMediaItem[] }>('/api/instagram-thumbnails')
      const thumbnails = response.data.data
        .filter((item: InstagramMediaItem) => item.media_type === 'IMAGE')
        .map((item: InstagramMediaItem) => item.thumbnail_url || item.media_url)
        .slice(0, 9) // 最大9枚のサムネイルを表示
      setThumbnails(thumbnails)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch Instagram thumbnails:', err)
      setError('Failed to load Instagram thumbnails')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading Instagram thumbnails...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Instagram Posts</h2>
      <div className="grid grid-cols-3 gap-4">
        {thumbnails.map((url, index) => (
          <img 
            key={index} 
            src={url} 
            alt={`Instagram thumbnail ${index + 1}`} 
            className="w-full h-auto object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  )
}