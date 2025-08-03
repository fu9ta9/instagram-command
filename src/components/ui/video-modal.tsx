"use client"

import React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
}

export function VideoModal({ isOpen, onClose, videoUrl, title = "デモ動画" }: VideoModalProps) {
  // ESCキーでモーダルを閉じる
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // モーダルが開いている間はスクロールを無効化
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              aria-label="モーダルを閉じる"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* タイトル */}
            {title && (
              <div className="absolute top-4 left-4 z-10 bg-black/50 rounded px-3 py-1">
                <h3 className="text-white text-sm font-medium">{title}</h3>
              </div>
            )}

            {/* 動画 */}
            <div className="w-full h-full">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                // YouTube動画の場合
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  title={title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl.includes('vimeo.com') ? (
                // Vimeo動画の場合
                <iframe
                  src={getVimeoEmbedUrl(videoUrl)}
                  title={title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // 直接動画ファイルの場合
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('動画の読み込みに失敗しました:', e)
                  }}
                >
                  お使いのブラウザは動画の再生に対応していません。
                </video>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// YouTube URLを埋め込み用URLに変換
function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url
}

// Vimeo URLを埋め込み用URLに変換
function getVimeoEmbedUrl(url: string): string {
  const videoId = extractVimeoVideoId(url)
  return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url
}

// YouTube動画IDを抽出
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Vimeo動画IDを抽出
function extractVimeoVideoId(url: string): string | null {
  const pattern = /(?:vimeo\.com\/)(\d+)/
  const match = url.match(pattern)
  return match ? match[1] : null
}