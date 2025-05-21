"use client"
import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const errorMessages: Record<string, string> = {
  OAuthSignin: "外部サービス認証に失敗しました。",
  OAuthCallback: "外部サービス認証のコールバックでエラーが発生しました。",
  OAuthCreateAccount: "アカウント作成時にエラーが発生しました。",
  EmailCreateAccount: "メールアカウント作成時にエラーが発生しました。",
  Callback: "認証コールバックでエラーが発生しました。",
  OAuthAccountNotLinked: "このメールアドレスは他の認証方法で登録されています。",
  EmailSignin: "メール認証に失敗しました。",
  CredentialsSignin: "メールアドレスまたはパスワードが正しくありません。",
  default: "認証エラーが発生しました。再度ログインしてください。"
}

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") || "default"

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login")
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">認証エラー</h1>
        <p className="mb-4 text-gray-700">{errorMessages[error] || errorMessages.default}</p>
        <p className="text-sm text-gray-500">3秒後にログイン画面へ自動で移動します。</p>
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.replace("/login")}
        >
          ログイン画面へ戻る
        </button>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
} 