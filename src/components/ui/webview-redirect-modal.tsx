"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, AlertCircle, Smartphone } from "lucide-react"

interface WebViewRedirectModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
}

// デフォルトブラウザーでページを開く
function openInDefaultBrowser(url: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const userAgent = navigator.userAgent.toLowerCase()
    
    // iOSの場合
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Instagram WebViewからの場合、カスタムスキームを使用
      if (userAgent.includes('instagram')) {
        // Instagram app内から外部ブラウザを開く方法
        const safariUrl = `x-safari-${url}`
        window.location.href = safariUrl
        
        // フォールバック: 通常のURLスキーム
        setTimeout(() => {
          window.location.href = `googlechrome://${url.replace(/https?:\/\//, '')}`
        }, 500)
        
        // 最終フォールバック
        setTimeout(() => {
          window.location.href = url
        }, 1000)
      } else {
        window.location.href = url
      }
      return
    }
    
    // Androidの場合
    if (/Android/.test(navigator.userAgent)) {
      if (userAgent.includes('instagram') || userAgent.includes('fb')) {
        // Instagram/Facebook WebViewからの場合
        const chromeIntent = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`
        window.location.href = chromeIntent
        
        // フォールバック: Samsung Internet
        setTimeout(() => {
          const samsungIntent = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.sec.android.app.sbrowser;S.browser_fallback_url=${encodeURIComponent(url)};end`
          window.location.href = samsungIntent
        }, 500)
        
        // 最終フォールバック
        setTimeout(() => {
          window.location.href = url
        }, 1000)
      } else {
        window.location.href = url
      }
      return
    }
    
    // その他の場合
    window.location.href = url
  } catch (error) {
    console.error('デフォルトブラウザーでの起動に失敗:', error)
    // フォールバック: 新しいタブで開く
    window.open(url, '_blank')
  }
}

// 現在のURLを取得
function getCurrentUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

export function WebViewRedirectModal({ 
  isOpen, 
  onClose, 
  onContinueAnyway 
}: WebViewRedirectModalProps) {
  const handleOpenInBrowser = () => {
    const currentUrl = getCurrentUrl()
    openInDefaultBrowser(currentUrl)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6">
                {/* アイコンとタイトル */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ブラウザーで開くことをおすすめします
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Instagram内のブラウザーでは、ログイン機能が正常に動作しない場合があります。
                    より安定した体験のため、デフォルトブラウザーで開いてください。
                  </p>
                </div>

                {/* ブラウザー誘導の説明 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-2">
                        推奨：デフォルトブラウザーで開く
                      </h4>
                      <p className="text-blue-700 text-xs leading-relaxed mb-2">
                        SafariやChromeなどの標準ブラウザーで開くことで、
                        Googleログインやその他の機能が正常に動作します。
                      </p>
                      <div className="bg-white rounded p-2 mt-2">
                        <p className="text-blue-800 text-xs font-medium mb-1">手動での開き方：</p>
                        <p className="text-blue-700 text-xs">
                          1. 右上の「...」メニューをタップ<br/>
                          2. 「ブラウザで開く」または「Safariで開く」を選択
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ボタン */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleOpenInBrowser}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    ブラウザーで開く（推奨）
                  </Button>
                  
                  <Button 
                    onClick={onContinueAnyway}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    size="lg"
                  >
                    このまま続ける
                  </Button>
                </div>

                {/* 注意事項 */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  ※ Instagram内ブラウザーで続ける場合、一部機能が制限される可能性があります
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}