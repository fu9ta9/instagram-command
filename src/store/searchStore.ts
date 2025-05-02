import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InstagramAccount = {
  id: string
  username: string
  name?: string
  avatar?: string
  followersCount?: number
  mediaCount?: number
}

export type InstagramPost = {
  id: string
  imageUrl: string
  permalink: string
  likes: number
  comments: number
  date: string
}

export type SortOption = 'recent' | 'likes' | 'comments'
export type LimitOption = '25' | 'all'

interface SearchState {
  account: InstagramAccount | null
  posts: InstagramPost[]
  sortBy: SortOption
  limit: LimitOption
  setAccount: (account: InstagramAccount | null) => void
  setPosts: (posts: InstagramPost[]) => void
  setSortBy: (sort: SortOption) => void
  setLimit: (limit: LimitOption) => void
  clearAll: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      account: null,
      posts: [],
      sortBy: 'recent',
      limit: '25',
      setAccount: (account) => set({ account }),
      setPosts: (posts) => set({ posts }),
      setSortBy: (sortBy) => set({ sortBy }),
      setLimit: (limit) => set({ limit }),
      clearAll: () => set({ account: null, posts: [], sortBy: 'recent', limit: '25' }),
    }),
    {
      name: 'search-store', // localStorageのキー
    }
  )
) 