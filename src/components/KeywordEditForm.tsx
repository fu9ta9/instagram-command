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

interface KeywordEditFormProps {
  id: number
  initialKeyword: string
  initialReply: string
  onEdit: () => void
  onCancel: () => void
}

export default function KeywordEditForm({ id, initialKeyword, initialReply, onEdit, onCancel }: KeywordEditFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      keyword: initialKeyword,
      reply: initialReply,
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update keyword')
      onEdit()
    } catch (error) {
      console.error('Error updating keyword:', error)
      setError('キーワードの更新に失敗しました')
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
      <div className="flex justify-between">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '更新中...' : '更新'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}