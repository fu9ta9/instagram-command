import { useState } from "react"
import { signIn } from "next-auth/react"

export function useWebViewLogin() {
  const [showWebViewModal, setShowWebViewModal] = useState(false)

  const detectWebView = () => {
    if (typeof window === 'undefined') return false
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    return (
      userAgent.includes('instagram') ||
      userAgent.includes('fban') ||
      userAgent.includes('fbav') ||
      userAgent.includes('fbiob') ||
      userAgent.includes('tiktok') ||
      userAgent.includes('twitter')
    )
  }

  const handleLogin = (callbackUrl: string = "/plan") => {
    // WebView検出
    const isWebView = detectWebView()
    
    if (isWebView) {
      // WebViewの場合は誘導モーダルを表示
      setShowWebViewModal(true)
      return { showModal: true, callbackUrl }
    }

    // 通常のブラウザーの場合はGoogleログインを実行
    signIn('google', { 
      callbackUrl,
      redirect: true 
    })
    return { showModal: false, callbackUrl }
  }

  const handleContinueInWebView = (callbackUrl: string = "/plan") => {
    setShowWebViewModal(false)
    // WebView内でもGoogleログインを試行（エラーの可能性あり）
    signIn('google', { 
      callbackUrl,
      redirect: true 
    })
  }

  const closeModal = () => {
    setShowWebViewModal(false)
  }

  return {
    showWebViewModal,
    handleLogin,
    handleContinueInWebView,
    closeModal,
    detectWebView
  }
}