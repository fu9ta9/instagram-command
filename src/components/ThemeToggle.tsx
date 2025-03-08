'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  // シンプルなトグルボタンに変更
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {}}
      className="rounded-full px-3 flex items-center gap-2 border"
      aria-label="テーマ切り替え"
    >
      <Moon className="h-4 w-4 text-blue-700" />
      <span className="text-xs font-medium">ダーク</span>
    </Button>
  )
}