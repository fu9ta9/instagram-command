'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ErrorMessage from './ErrorMessage'

const schema = z.object({
  keyword: z.string().min(1, { message: "キーワードを入力してください" }),
  reply: z.string().min(1, { message: "返信内容を入力してください" }),
})

type FormData = z.infer<typeof schema>

export default function KeywordForm({ onKeywordAdded }: { onKeywordAdded: () => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      // if (!response.ok) throw new Error('Failed to create keyword')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'キーワードの登録に失敗しました')
      }
      reset()
      onKeywordAdded()
    } catch (error) {
      console.error('Error creating keyword:', error)
      setError('キーワードの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <div>
        <Input
          placeholder="キーワード"
          {...register("keyword")}
        />
        {errors.keyword && <p className="mt-1 text-sm text-red-600">{errors.keyword.message}</p>}
      </div>
      <div>
        <Input
          placeholder="返信内容"
          {...register("reply")}
        />
        {errors.reply && <p className="mt-1 text-sm text-red-600">{errors.reply.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '登録中...' : '登録'}
      </Button>
    </form>
  )
}