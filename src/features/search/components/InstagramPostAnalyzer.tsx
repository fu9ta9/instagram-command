"use client"

import { Search, Loader2, Heart, MessageCircle, User, Users, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMobile } from "@/hooks/use-mobile"
import { useInstagramSearch } from '../hooks/useInstagramSearch'
import { useInstagramUtils } from '../hooks/useInstagramUtils'
import { SortOption, LimitOption } from '../types/search.types'

// 表示件数オプションの定義
const LIMIT_OPTIONS = [
  { value: '25', label: '25件' },
  { value: 'all', label: 'すべて' },
] as const

export default function InstagramPostAnalyzer() {
  const isMobile = useMobile()
  const { formatNumber, handlePostClick } = useInstagramUtils()
  
  const {
    searchInput,
    recentAccounts,
    isLoading,
    showRecentAccounts,
    isProcessing,
    account,
    posts,
    sortBy,
    limit,
    setSearchInput,
    setShowRecentAccounts,
    handleSearch,
    handleSortChange,
    handleLimitChange,
    selectRecentAccount,
    handleSearchInputChange
  } = useInstagramSearch()

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Instagramのユーザー名を入力"
              value={searchInput}
              onChange={handleSearchInputChange}
              className="pr-10 mt-1 ml-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-2 bg-white"
            />
            {searchInput && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchInput("")}
              >
                ×
              </button>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !searchInput.trim()}
            className="w-20 min-w-[5rem] px-2 mt-1 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">検索</span>
              </>
            )}
          </Button>
        </div>
        
        {/* 最近検索したアカウント */}
        {showRecentAccounts && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">最近の検索</div>
              {recentAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => selectRecentAccount(account)}
                >
                  <div className="flex-shrink-0">
                    {account.avatar ? (
                      <img 
                        src={account.avatar} 
                        alt={account.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">@{account.username}</div>
                    {account.name && account.name !== account.username && (
                      <div className="text-xs text-gray-500">{account.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* プロフィール情報とフィルター */}
      <div className="space-y-4">
        {/* プロフィール情報 */}
        {account && (
          <div className="bg-white p-4 rounded-lg border">
            {/* モバイル：横並び、PC：従来 */}
            <div className="flex items-center gap-4 sm:flex-row flex-row">
              <div className="flex-shrink-0">
                {account.avatar ? (
                  <img 
                    src={account.avatar} 
                    alt={account.username}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-start sm:items-start">
                  <span className="text-base font-bold truncate max-w-full">@{account.username}</span>
                  {account.name && account.name !== account.username && (
                    <span className="text-sm text-gray-600 truncate max-w-full">{account.name}</span>
                  )}
                  <div className="flex gap-3 mt-1">
                    {account.followersCount !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold text-gray-800">{formatNumber(account.followersCount)}</span>フォロワー
                      </span>
                    )}
                    {account.mediaCount !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-semibold text-gray-800">{formatNumber(account.mediaCount)}</span>投稿
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フィルターオプション */}
        {account && (
          <>
            <div className="flex flex-wrap gap-2 items-center justify-start mb-4">
              {/* 並び替えボタン（ラベル削除、楕円形、SP用ラベル変更） */}
              <div className="flex gap-1 items-center">
                {['recent', 'likes', 'comments'].map((key) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? "default" : "outline"}
                    onClick={() => handleSortChange(key as SortOption)}
                    disabled={isProcessing || isLoading}
                    className="rounded-full px-3 py-0.5 text-xs h-7 min-w-0"
                  >
                    {key === 'recent' ? '最新順' : key === 'likes' ? 'いいね順' : 'コメント順'}
                  </Button>
                ))}
              </div>
              {/* 件数ディスクロージャー（SPのみ） */}
              <div className="relative ml-auto">
                {isMobile ? (
                  <Select value={limit} onValueChange={v => handleLimitChange(v as LimitOption)}>
                    <SelectTrigger className="rounded-full px-3 py-0.5 text-xs h-7 min-w-0 w-auto border border-gray-300 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="25件">
                        {limit === '25' ? '25件' : limit === 'all' ? 'すべて' : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="end" className="min-w-[6rem] bg-white">
                      <SelectItem value="25">25件</SelectItem>
                      <SelectItem value="all">すべて</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  LIMIT_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={limit === option.value ? "default" : "outline"}
                      onClick={() => handleLimitChange(option.value as LimitOption)}
                      disabled={isProcessing || isLoading}
                      className="rounded-full px-3 py-0.5 text-xs h-7 min-w-0 ml-2"
                    >
                      {option.label}
                    </Button>
                  ))
                )}
              </div>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 mb-2 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">ソート中...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 投稿グリッド */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2" style={{gridTemplateColumns: 'repeat(3, minmax(0, 120px))', justifyContent: 'center'}}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden max-w-[120px]">
              <Skeleton className="h-[300px] w-full" />
              <CardContent className="p-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
              onClick={() => handlePostClick(post.permalink)}
            >
              <div className="aspect-square relative w-full">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-full object-cover sm:rounded-t-lg w-[120px] sm:w-[180px] lg:w-[300px]"
                  style={{ display: 'block' }}
                  onError={e => {
                    if (!e.currentTarget.src.includes('noimage.svg')) {
                      e.currentTarget.src = '/noimage.svg';
                    }
                  }}
                />
                {/* PCモード：左上に日付 */}
                <div className="absolute top-2 left-2 hidden sm:block bg-white bg-opacity-80 rounded px-2 py-0.5 text-xs text-gray-700 font-medium">
                  {post.date ? new Date(post.date).toLocaleDateString('ja-JP', { year: '2-digit', month: '2-digit', day: '2-digit' }) : ''}
                </div>
                {/* 外部リンクアイコン（PCは小さめ） */}
                <div className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 sm:p-1">
                  <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 text-gray-700" />
                </div>
                {/* サムネイル画像の下にいいね数・コメント数を表示 */}
                <div className="w-full flex justify-between items-center px-1 py-1 bg-transparent sm:px-3 sm:py-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">{formatNumber(post.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">{formatNumber(post.comments)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : account ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 mb-4 text-gray-300">
            <img src="/placeholder.svg?height=96&width=96" alt="投稿が見つかりません" className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold mb-2">投稿が見つかりません</h3>
          <p className="text-gray-500 max-w-md">
            このアカウントには投稿がないか、利用できません。
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 mb-4 text-gray-300">
            <Search className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Instagramアカウントを検索</h3>
          <p className="text-gray-500 max-w-md">
            Instagramのユーザー名を入力して、投稿とエンゲージメント指標を分析します。
          </p>
        </div>
      )}

      {/* ローディング表示 */}
      {(isLoading || isProcessing) && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  )
}