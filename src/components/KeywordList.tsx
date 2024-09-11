'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import ErrorMessage from './ErrorMessage'
import KeywordEditForm from './KeywordEditForm'
import { useSession } from 'next-auth/react'

type Keyword = {
  id: number;
  keyword: string;
  reply: string;
}

export default function KeywordList({ onKeywordDeleted }: { onKeywordDeleted: () => void }) {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/keywords')
      if (!response.ok) throw new Error('Failed to fetch keywords')
      const data = await response.json()
      setKeywords(data)
    } catch (error) {
      console.error('Error fetching keywords:', error)
      setError('キーワードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      const response = await fetch(`/api/keywords/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete keyword')
      onKeywordDeleted()
      fetchKeywords()
    } catch (error) {
      console.error('Error deleting keyword:', error)
      setError('キーワードの削除に失敗しました')
    }
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  const handleEditComplete = () => {
    setEditingId(null)
    fetchKeywords()
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <ErrorMessage message={error} />

  return (
    <ul className="space-y-4">
      {keywords.map(kw => (
        <li key={kw.id} className="border p-4 rounded">
          {editingId === kw.id ? (
            <KeywordEditForm
              id={kw.id}
              initialKeyword={kw.keyword}
              initialReply={kw.reply}
              onEdit={handleEditComplete}
              onCancel={handleEditCancel}
            />
          ) : (
            <>
              <p><strong>キーワード:</strong> {kw.keyword}</p>
              <p><strong>返信:</strong> {kw.reply}</p>
              <div className="mt-2 space-x-2">
                <Button onClick={() => handleEdit(kw.id)} variant="outline">
                  編集
                </Button>
                <Button onClick={() => handleDelete(kw.id)} variant="destructive">
                  削除
                </Button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}