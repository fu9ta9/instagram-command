import { InstagramPost, SortOption } from '../types/search.types'

export class PostService {
  /**
   * 並び替え処理（クライアントサイド）
   */
  static sortPosts(postsToSort: InstagramPost[], sortType: SortOption): InstagramPost[] {
    return [...postsToSort].sort((a, b) => {
      switch (sortType) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'likes':
          return b.likes - a.likes
        case 'comments':
          return b.comments - a.comments
        default:
          return 0
      }
    })
  }

  /**
   * 件数制限に基づいて投稿をフィルタリング
   */
  static filterPostsByLimit(
    allPosts: InstagramPost[], 
    limit: '25' | 'all', 
    sortBy: SortOption
  ): InstagramPost[] {
    if (limit === 'all') {
      return allPosts
    }
    
    // 最新25件を取得してソート
    const latest25 = [...allPosts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 25)
    
    return this.sortPosts(latest25, sortBy)
  }
}