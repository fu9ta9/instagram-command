"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, Heart, MessageCircle, History, User, Users, SlidersHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMobile } from "@/hooks/use-mobile"

// Instagram投稿の型定義
interface InstagramPost {
  id: string
  imageUrl: string
  permalink: string
  likes: number
  comments: number
  date: string
}

// Instagramアカウントの型定義
interface InstagramAccount {
  id: string
  username: string
  name?: string
  avatar?: string
  followersCount?: number
  mediaCount?: number
}

// API レスポンスの型定義
interface InstagramApiResponse {
  posts: InstagramPost[]
  meta: {
    followers_count: number
    media_count: number
    account_info: {
      name: string
      username: string
      profile_picture_url: string
    }
  }
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

type SortOption = "recent" | "likes" | "comments"
type LimitOption = "25" | "all"

// ローカルストレージのキー
const RECENT_ACCOUNTS_KEY = "instagram-recent-accounts"

export default function InstagramPostAnalyzer() {
  const isMobile = useMobile()
  const [searchInput, setSearchInput] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null)
  const [recentAccounts, setRecentAccounts] = useState<InstagramAccount[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [limit, setLimit] = useState<LimitOption>("25")
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [showRecentAccounts, setShowRecentAccounts] = useState(false)
  const [allPostsData, setAllPostsData] = useState<InstagramPost[]>([])

  // 最近検索したアカウントをローカルストレージから読み込む
  useEffect(() => {
    const savedAccounts = localStorage.getItem(RECENT_ACCOUNTS_KEY)
    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts)
        setRecentAccounts(parsedAccounts)
      } catch (error) {
        console.error("保存されたアカウントの解析エラー:", error)
      }
    }
  }, [])

  // 検索入力が変更されたときの処理
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // 入力があれば最近のアカウントを表示
    setShowRecentAccounts(value.length > 0 && recentAccounts.length > 0)
  }

  // 通常の投稿を取得する関数（25件まで）
  const fetchPosts = useCallback(async (accountId: string): Promise<InstagramApiResponse> => {
    try {
      console.log(`通常投稿取得リクエスト: accountId=${accountId}, sortBy=${sortBy}`);
      
      // URLを構築 - 通常の投稿取得（25件まで）
      const url = `/api/instagram/search/posts?accountId=${accountId}&sortBy=${sortBy}&limit=25`;
      
      // fetch APIを使用
      const response = await fetch(url);
      console.log(`APIレスポンスステータス: ${response.status}`);
      
      // JSONデータを解析
      const data = await response.json();
      
      // エラーチェック
      if (!response.ok) {
        console.error('API エラーレスポンス:', data);
        throw new Error(data.message || `API error: ${response.status}`);
      }
      
      console.log(`投稿取得成功: ${data.posts?.length || 0}件`);
      return data;
    } catch (error) {
      console.error("投稿取得エラー:", error);
      throw error;
    }
  }, [sortBy]);

  // すべての投稿を取得する関数
  const fetchAllPosts = useCallback(async (accountId: string): Promise<InstagramApiResponse> => {
    try {
      console.log(`すべての投稿取得リクエスト: accountId=${accountId}, sortBy=${sortBy}`);
      setIsLoadingAll(true);
      
      // URLを構築 - すべての投稿取得
      const url = `/api/instagram/search/all-posts?accountId=${accountId}&sortBy=${sortBy}`;
      
      // fetch APIを使用
      const response = await fetch(url);
      console.log(`APIレスポンスステータス: ${response.status}`);
      
      // JSONデータを解析
      const data = await response.json();
      
      // エラーチェック
      if (!response.ok) {
        console.error('API エラーレスポンス:', data);
        throw new Error(data.message || `API error: ${response.status}`);
      }
      
      console.log(`すべての投稿取得成功: ${data.posts?.length || 0}件`);
      return data;
    } catch (error) {
      console.error("すべての投稿取得エラー:", error);
      throw error;
    } finally {
      setIsLoadingAll(false);
    }
  }, [sortBy]);

  // 検索ボタンがクリックされたときの処理
  const handleSearch = async () => {
    if (!searchInput.trim()) return

    setIsLoading(true)
    setPosts([])
    setAllPostsData([])

    // 入力されたユーザー名をアカウントとして設定
    const newAccount: InstagramAccount = {
      id: searchInput.trim(),
      username: searchInput.trim()
    }
    
    setSelectedAccount(newAccount)

    try {
      // 通常の投稿取得（25件まで）
      const result = await fetchPosts(newAccount.id)
      
      // 結果を設定
      const fetchedPosts = result.posts || []
      setPosts(fetchedPosts)
      setAllPostsData(fetchedPosts) // 初期状態では同じ
      
      // アカウント情報を更新（APIからの追加情報があれば）
      if (result.meta) {
        const meta = result.meta
        if (meta.account_info) {
          newAccount.name = meta.account_info.name || newAccount.username
          newAccount.avatar = meta.account_info.profile_picture_url
        }
        newAccount.followersCount = meta.followers_count
        newAccount.mediaCount = meta.media_count
        
        // 選択中のアカウント情報を更新
        setSelectedAccount({...newAccount})
      }
      
      // 最近のアカウントに追加
      saveRecentAccount(newAccount)
    } catch (error) {
      console.error("投稿取得エラー:", error)
      setPosts([])
      setAllPostsData([])
    } finally {
      setIsLoading(false)
    }
  }

  // 表示件数が変更されたときの処理
  const handleLimitChange = async (value: string) => {
    const newLimit = value as LimitOption
    setLimit(newLimit)
    
    if (!selectedAccount) return
    
    if (newLimit === "all" && allPostsData.length <= 25) {
      // 「すべて」が選択され、まだすべての投稿を取得していない場合
      try {
        const result = await fetchAllPosts(selectedAccount.id)
        const allPosts = result.posts || []
        setAllPostsData(allPosts)
        setPosts(allPosts)
      } catch (error) {
        console.error("すべての投稿取得エラー:", error)
      }
    } else if (newLimit === "all") {
      // すでにすべての投稿を取得済みの場合
      setPosts(allPostsData)
    } else {
      // 25件表示に戻す場合
      setPosts(allPostsData.slice(0, 25))
    }
  }

  // 並べ替えが変更されたときの処理
  const handleSortChange = async (value: string) => {
    const newSortBy = value as SortOption
    setSortBy(newSortBy)
    
    if (!selectedAccount) return
    
    // 現在の表示モードに応じて再取得または再ソート
    if (limit === "all") {
      try {
        // すべての投稿を新しいソート順で再取得
        const result = await fetchAllPosts(selectedAccount.id)
        const sortedPosts = result.posts || []
        setAllPostsData(sortedPosts)
        setPosts(sortedPosts)
      } catch (error) {
        console.error("ソート変更時のエラー:", error)
      }
    } else {
      try {
        // 通常の投稿を新しいソート順で再取得
        const result = await fetchPosts(selectedAccount.id)
        const sortedPosts = result.posts || []
        setPosts(sortedPosts)
        setAllPostsData(sortedPosts)
      } catch (error) {
        console.error("ソート変更時のエラー:", error)
      }
    }
  }

  // 投稿をクリックしたときの処理
  const handlePostClick = (permalink: string) => {
    window.open(permalink, '_blank')
  }

  // 数値を読みやすい形式に変換する関数
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num.toString()
    }
  }

  // 最近検索したアカウントを選択
  const selectRecentAccount = (account: InstagramAccount) => {
    setSearchInput(account.username)
    setShowRecentAccounts(false)
    
    // 選択されたアカウントで検索を実行
    setSelectedAccount(account)
    setIsLoading(true)
    setPosts([])
    setAllPostsData([])
    
    // 投稿を取得
    fetchPosts(account.id)
      .then(result => {
        const fetchedPosts = result.posts || []
        setPosts(fetchedPosts)
        setAllPostsData(fetchedPosts)
        
        // アカウント情報を更新（APIからの追加情報があれば）
        if (result.meta) {
          const meta = result.meta
          if (meta.account_info) {
            account.name = meta.account_info.name || account.username
            account.avatar = meta.account_info.profile_picture_url
          }
          account.followersCount = meta.followers_count
          account.mediaCount = meta.media_count
          
          // 選択中のアカウント情報を更新
          setSelectedAccount({...account})
        }
      })
      .catch(error => {
        console.error("最近のアカウント選択時のエラー:", error)
        setPosts([])
        setAllPostsData([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 最近検索したアカウントを保存
  const saveRecentAccount = (account: InstagramAccount) => {
    // 既存のアカウントリストから同じIDのアカウントを除外
    const filteredAccounts = recentAccounts.filter(a => a.id !== account.id)
    
    // 新しいアカウントを先頭に追加
    const updatedAccounts = [account, ...filteredAccounts].slice(0, 5) // 最大5件まで保存
    setRecentAccounts(updatedAccounts)
    
    // ローカルストレージに保存
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
  }

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
              className="pr-10 w-full"
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
            className="w-20 min-w-[5rem] px-2" // 幅を固定
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">検索中...</span>
                <span className="sm:hidden">...</span>
              </>
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
        {selectedAccount && (
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* プロフィール画像 */}
              <div className="flex-shrink-0">
                {selectedAccount.avatar ? (
                  <img 
                    src={selectedAccount.avatar} 
                    alt={selectedAccount.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* アカウント情報 */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold">@{selectedAccount.username}</h2>
                {selectedAccount.name && selectedAccount.name !== selectedAccount.username && (
                  <p className="text-gray-600">{selectedAccount.name}</p>
                )}
                
                {/* フォロワー数と投稿数 */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                  {selectedAccount.followersCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{formatNumber(selectedAccount.followersCount)}</span> フォロワー
                      </span>
                    </div>
                  )}
                  
                  {selectedAccount.mediaCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{formatNumber(selectedAccount.mediaCount)}</span> 投稿
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フィルターオプション */}
        {posts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">フィルター:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* 表示件数フィルター */}
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap text-sm">表示件数:</Label>
                <Select
                  value={limit}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-[90px] h-8 text-sm">
                    <SelectValue placeholder="表示件数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25件</SelectItem>
                    <SelectItem value="all">すべて</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 並べ替えフィルター */}
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap text-sm">並べ替え:</Label>
                <Select
                  value={sortBy}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[120px] h-8 text-sm">
                    <SelectValue placeholder="並べ替え" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">最新順</SelectItem>
                    <SelectItem value="likes">いいね数順</SelectItem>
                    <SelectItem value="comments">コメント数順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-500">
                {posts.length}件の投稿
                {isLoadingAll && <span className="ml-2 text-blue-500">読み込み中...</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 投稿グリッド */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePostClick(post.permalink)}
            >
              <div className="aspect-square relative">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1">
                  <ExternalLink className="h-4 w-4 text-gray-700" />
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>{post.comments.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedAccount ? (
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
    </div>
  )
} 