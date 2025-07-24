"use client"

import { useState, useEffect } from "react"
import { useSearchStore } from '../store/searchStore'
import { InstagramAccount, InstagramPost, SortOption, LimitOption } from '../types/search.types'
import { InstagramApiService } from '../services/instagramApi'
import { PostService } from '../services/postService'
import { StorageService } from '../services/storageService'

export function useInstagramSearch() {
  // Zustandストアから状態とsetterを取得
  const {
    account, posts, sortBy, limit,
    setAccount, setPosts, setSortBy, setLimit
  } = useSearchStore()

  // ローカル状態
  const [searchInput, setSearchInput] = useState(account?.username || "")
  const [recentAccounts, setRecentAccounts] = useState<InstagramAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRecentAccounts, setShowRecentAccounts] = useState(false)
  const [allPostsData, setAllPostsData] = useState<InstagramPost[]>(posts)
  const [isProcessing, setIsProcessing] = useState(false)

  // Zustandストアのpostsが変わったらallPostsDataも同期
  useEffect(() => {
    setAllPostsData(posts)
  }, [posts])

  // Zustandストアのaccountが変わったら検索入力も同期
  useEffect(() => {
    if (account?.username) setSearchInput(account.username)
  }, [account])

  // 最近検索したアカウントをローカルストレージから読み込む
  useEffect(() => {
    const accounts = StorageService.loadRecentAccounts()
    setRecentAccounts(accounts)
  }, [])

  // 検索入力が変更されたときの処理
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    setShowRecentAccounts(value.length > 0 && recentAccounts.length > 0)
  }

  // 検索ボタンがクリックされたときの処理
  const handleSearch = async () => {
    if (!searchInput.trim()) return

    setShowRecentAccounts(false)
    setSortBy('recent')
    setLimit('25')
    setIsLoading(true)
    setPosts([])
    setAllPostsData([])

    const newAccount: InstagramAccount = {
      id: searchInput.trim(),
      username: searchInput.trim()
    }
    setAccount(newAccount)

    try {
      const result = await InstagramApiService.fetchPosts(newAccount.id, 'recent')
      const fetchedPosts = result.posts || []
      setPosts(fetchedPosts)
      setAllPostsData(fetchedPosts)
      
      // アカウント情報を更新（APIからの追加情報があれば）
      if (result.meta) {
        const meta = result.meta
        if (meta.account_info) {
          newAccount.name = meta.account_info.name || newAccount.username
          newAccount.avatar = meta.account_info.profile_picture_url
        }
        newAccount.followersCount = meta.followers_count
        newAccount.mediaCount = meta.media_count
        setAccount({ ...newAccount })
      }
      
      // 最近のアカウントを保存
      const updatedAccounts = StorageService.saveRecentAccount(newAccount, recentAccounts)
      setRecentAccounts(updatedAccounts)
    } catch (error) {
      setPosts([])
      setAllPostsData([])
    } finally {
      setIsLoading(false)
    }
  }

  // 並び替えが変更されたときの処理
  const handleSortChange = async (newSortBy: SortOption) => {
    if (!account || isProcessing) return
    setIsProcessing(true)
    setSortBy(newSortBy)
    
    try {
      const sortedPosts = PostService.sortPosts(posts, newSortBy)
      setPosts(sortedPosts)
      const sortedAllPosts = PostService.sortPosts(allPostsData, newSortBy)
      setAllPostsData(sortedAllPosts)
    } finally {
      setIsProcessing(false)
    }
  }

  // 表示件数が変更されたときの処理
  const handleLimitChange = async (newLimit: LimitOption) => {
    if (!account || isProcessing) return
    setIsProcessing(true)
    setLimit(newLimit)
    
    try {
      if (newLimit === "all" && allPostsData.length <= 25) {
        // 全件データが未取得の場合はAPI呼び出し
        const result = await InstagramApiService.fetchAllPosts(account.id, sortBy)
        const allPosts = result.posts || []
        setAllPostsData(allPosts)
        setPosts(allPosts)
      } else {
        // 既存データから件数制限でフィルタリング
        const filteredPosts = PostService.filterPostsByLimit(allPostsData, newLimit, sortBy)
        setPosts(filteredPosts)
      }
    } catch (error) {
      // エラー時は何もしない
    } finally {
      setIsProcessing(false)
    }
  }

  // 最近検索したアカウントを選択
  const selectRecentAccount = (selectedAccount: InstagramAccount) => {
    setSortBy('recent')
    setLimit('25')
    setSearchInput(selectedAccount.username)
    setShowRecentAccounts(false)
    setAccount(selectedAccount)
    setIsLoading(true)
    setPosts([])
    setAllPostsData([])
    
    InstagramApiService.fetchPosts(selectedAccount.id, 'recent')
      .then(result => {
        const fetchedPosts = result.posts || []
        setPosts(fetchedPosts)
        setAllPostsData(fetchedPosts)
        
        // アカウント情報を更新（APIからの追加情報があれば）
        if (result.meta) {
          const meta = result.meta
          if (meta.account_info) {
            selectedAccount.name = meta.account_info.name || selectedAccount.username
            selectedAccount.avatar = meta.account_info.profile_picture_url
          }
          selectedAccount.followersCount = meta.followers_count
          selectedAccount.mediaCount = meta.media_count
          setAccount({ ...selectedAccount })
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

  return {
    // State
    searchInput,
    recentAccounts,
    isLoading,
    showRecentAccounts,
    isProcessing,
    account,
    posts,
    sortBy,
    limit,
    
    // Actions
    setSearchInput,
    setShowRecentAccounts,
    handleSearch,
    handleSortChange,
    handleLimitChange,
    selectRecentAccount,
    handleSearchInputChange
  }
}