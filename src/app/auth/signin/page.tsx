"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { WebViewRedirectModal } from "@/components/ui/webview-redirect-modal";
import { useWebViewLogin } from "@/hooks/useWebViewLogin";
import Image from "next/image";

function SignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/connect";
  
  const { 
    showWebViewModal, 
    handleLogin, 
    handleContinueInWebView, 
    closeModal 
  } = useWebViewLogin();
  
  const [currentCallbackUrl, setCurrentCallbackUrl] = useState(callbackUrl);
  const [isLoading, setIsLoading] = useState(false);

  // セッションが存在する場合はリダイレクト
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [session, status, callbackUrl, router]);

  // エラーメッセージの生成
  const getErrorMessage = () => {
    switch (error) {
      case "SessionRequired":
        return "ログインが必要です。セッションの有効期限が切れている可能性があります。";
      case "AccessDenied":
        return "アクセスが拒否されました。認証に失敗しました。";
      case "Configuration":
        return "認証設定に問題があります。しばらく時間をおいてから再度お試しください。";
      case "Verification":
        return "認証の検証に失敗しました。もう一度ログインをお試しください。";
      case "Default":
      default:
        return "ログインに失敗しました。もう一度お試しください。";
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setCurrentCallbackUrl(callbackUrl);
    
    const result = handleLogin(callbackUrl);
    if (!result.showModal) {
      // WebViewではない場合、直接ログイン処理が実行される
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Image 
              src="/icon.svg" 
              alt="InstaCommand Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8"
            />
            <span>InstaCommand</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ホームに戻る
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ログインエラー
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* エラーメッセージ */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm leading-relaxed">
                  {getErrorMessage()}
                </p>
              </div>

              {/* 解決方法の説明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  解決方法
                </h4>
                <ul className="text-blue-800 text-xs space-y-1">
                  <li>• 下記のボタンから再度ログインをお試しください</li>
                  <li>• ブラウザのキャッシュをクリアしてみてください</li>
                  <li>• 問題が続く場合は、しばらく時間をおいてから再度お試しください</li>
                </ul>
              </div>

              {/* ログインボタン */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Googleでログイン
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ページを再読み込み
                </Button>
              </div>

              {/* 注意事項 */}
              <p className="text-xs text-gray-500 text-center">
                ログインできない場合は、ブラウザのプライベートモードをお試しください
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* WebView警告モーダル */}
      <WebViewRedirectModal 
        isOpen={showWebViewModal}
        onClose={closeModal}
        onContinueAnyway={() => handleContinueInWebView(currentCallbackUrl)}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">読み込み中...</span>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}