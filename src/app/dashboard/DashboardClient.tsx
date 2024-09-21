'use client'

import { useState } from 'react'
import KeywordForm from '@/components/KeywordForm'
import KeywordList from '@/components/KeywordList'

interface Keyword {
  id: string;
  keyword: string;
  reply: string;
  postImage: string;
}

export default function DashboardClient() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  const handleKeywordAdded = (data: Omit<Keyword, 'id'>) => {
    const newKeyword = {
      ...data,
      id: Date.now().toString(), // 仮のID生成
    };
    setKeywords(prev => [newKeyword, ...prev]);
  };

  const handleKeywordDeleted = (id: string) => {
    setKeywords(prev => prev.filter(keyword => keyword.id !== id));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">キーワード管理ダッシュボード</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <KeywordForm onKeywordAdded={handleKeywordAdded} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">自動返信一覧</h2>
          <KeywordList keywords={keywords} onKeywordDeleted={handleKeywordDeleted} />
        </div>
      </div>
    </div>
  )
}