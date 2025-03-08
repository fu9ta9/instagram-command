'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Reply, ReplyInput } from '@/types/reply'
import { X, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ReplyEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReplyInput) => void
  initialData: Reply
}

export default function ReplyEditModal({ isOpen, onClose, onSubmit, initialData }: ReplyEditModalProps) {
  const [formData, setFormData] = useState<ReplyInput>({
    keyword: '',
    reply: '',
    replyType: 2,
    matchType: 1,
    postId: '',
    buttons: []
  })

  // 初期データをセット
  useEffect(() => {
    if (initialData) {
      setFormData({
        keyword: initialData.keyword,
        reply: initialData.reply,
        postId: initialData.postId || undefined,
        replyType: initialData.replyType,
        matchType: initialData.matchType,
        buttons: initialData.buttons?.map(button => ({
          title: button.title,
          url: button.url,
          order: button.order
        })) || []
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }))
  }

  const handleAddButton = () => {
    setFormData(prev => ({
      ...prev,
      buttons: [...(prev.buttons || []), { title: '', url: '', order: prev.buttons?.length || 0 }]
    }))
  }

  const handleRemoveButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons?.filter((_, i) => i !== index) || []
    }))
  }

  const handleButtonChange = (index: number, field: 'title' | 'url', value: string) => {
    setFormData(prev => {
      const newButtons = [...(prev.buttons || [])]
      newButtons[index] = { ...newButtons[index], [field]: value }
      return { ...prev, buttons: newButtons }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>自動返信を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">キーワード</label>
            <Input
              name="keyword"
              value={formData.keyword}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">返信メッセージ</label>
            <Textarea
              name="reply"
              value={formData.reply}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">返信タイプ</label>
              <Select
                value={formData.replyType?.toString()}
                onValueChange={(value) => handleSelectChange('replyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="返信タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">特定の投稿</SelectItem>
                  <SelectItem value="2">すべての投稿</SelectItem>
                  <SelectItem value="3">ストーリー</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">一致タイプ</label>
              <Select
                value={formData.matchType?.toString()}
                onValueChange={(value) => handleSelectChange('matchType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="一致タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">完全一致</SelectItem>
                  <SelectItem value="2">部分一致</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">ボタン</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddButton}
              >
                <Plus className="h-4 w-4 mr-1" /> ボタンを追加
              </Button>
            </div>
            {formData.buttons?.map((button, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="ボタンテキスト"
                  value={button.title}
                  onChange={(e) => handleButtonChange(index, 'title', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={button.url}
                  onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveButton(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              更新
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 