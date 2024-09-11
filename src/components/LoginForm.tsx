'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const schema = z.object({
  username: z.string().min(1, { message: "ユーザー名を入力してください" }),
  password: z.string().min(1, { message: "パスワードを入力してください" }),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const result = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false,
    })
    setIsLoading(false)
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      // エラーハンドリング
      alert('ログインに失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="ユーザー名"
          {...register("username")}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
      </div>
      <div>
        <Input
          type="password"
          placeholder="パスワード"
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </Button>
    </form>
  )
}