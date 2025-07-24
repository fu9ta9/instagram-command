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

// API レスポンスの型定義
export interface InstagramApiResponse {
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