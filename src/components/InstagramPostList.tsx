import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';

interface InstagramPost {
  id: string;
  media_type: string; // CAROUSEL_ALBUM, IMAGE, VIDEO
  media_product_type: 'FEED' | 'REELS';
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  comments_count: number;
  like_count: number;
}

interface PagingInfo {
  cursors: {
    before: string;
    after: string;
  };
  next?: string;
}

interface InstagramPostListProps {
  onSelectPost: (post: InstagramPost) => void;
  initialSelectedPostId?: string;
  onNext?: () => void; // 次へボタンのコールバック
}

const InstagramPostList: React.FC<InstagramPostListProps> = ({ 
  onSelectPost, 
  initialSelectedPostId,
  onNext 
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'reel'>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialSelectedPostId || null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoadedAllData, setHasLoadedAllData] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 初回読み込み
  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  // 初期選択投稿IDの設定
  useEffect(() => {
    if (initialSelectedPostId) {
      setSelectedPostId(initialSelectedPostId);
      setShowNextButton(true);
    }
  }, [initialSelectedPostId]);

  // 選択された投稿の処理
  useEffect(() => {
    if (selectedPostId && posts.length > 0) {
      const post = posts.find(p => p.id === selectedPostId);
      if (post) {
        onSelectPost(post);
        setShowNextButton(true);
      }
    } else {
      setShowNextButton(false);
    }
  }, [posts, selectedPostId, onSelectPost]);

  // 無限スクロールの設定
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore && nextPageUrl) {
        loadMorePosts();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, nextPageUrl]);

  // タブ切り替え時の処理
  useEffect(() => {
    // タブ切り替え時は選択をリセット
    if (posts.length > 0) {
      setSelectedPostId(null);
      setShowNextButton(false);
      
      // タブ切り替え時にフィルタリングした結果、表示する投稿がない場合は追加データを読み込む
      const filteredPosts = filterPostsByActiveTab(posts);
      if (filteredPosts.length === 0 && nextPageUrl && !hasLoadedAllData) {
        loadMorePosts();
      }
    }
  }, [activeTab]);

  // 最初の投稿を取得
  const fetchInstagramPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/instagram/posts');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404 && errorData.error === 'Instagram business account not found') {
          setError(errorData.message);
        } else {
          setError(errorData.message || '投稿の取得に失敗しました');
        }
        return;
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setPosts(data.data);
        
        // 次のページURLがあれば保存
        if (data.paging?.next) {
          setNextPageUrl(data.paging.next);
          setHasMore(true);
        } else {
          setHasMore(false);
          setHasLoadedAllData(true);
        }
      } else {
        setPosts([]);
        setHasMore(false);
        setHasLoadedAllData(true);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('投稿の取得中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 追加の投稿を読み込む
  const loadMorePosts = async () => {
    if (!nextPageUrl || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // nextPageUrlからafterトークンを抽出
      const url = new URL(nextPageUrl);
      const afterToken = url.searchParams.get('after');
      
      if (!afterToken) {
        console.error('After token not found in next page URL');
        setHasMore(false);
        return;
      }
      
      const response = await fetch(`/api/instagram/posts?after=${afterToken}`);
      
      if (!response.ok) {
        throw new Error('Failed to load more posts');
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // 新しい投稿を追加
        setPosts(prevPosts => [...prevPosts, ...data.data]);
        
        // 次のページURLがあれば保存
        if (data.paging?.next) {
          setNextPageUrl(data.paging.next);
          setHasMore(true);
        } else {
          setHasMore(false);
          setHasLoadedAllData(true);
        }
      } else {
        setHasMore(false);
        setHasLoadedAllData(true);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('追加の投稿の読み込みに失敗しました');
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 投稿をクリックしたときの処理
  const handlePostClick = (post: InstagramPost) => {
    setSelectedPostId(post.id);
    onSelectPost(post);
  };

  // アクティブなタブに基づいて投稿をフィルタリングする関数
  const filterPostsByActiveTab = (postList: InstagramPost[]) => {
    return postList.filter(post => {
      if (activeTab === 'feed') {
        return post.media_product_type === 'FEED' || 
               (post.media_type && ['IMAGE', 'CAROUSEL_ALBUM'].includes(post.media_type));
      } else {
        return post.media_product_type === 'REELS' || 
               (post.media_type && post.media_type === 'VIDEO' && post.media_product_type !== 'FEED');
      }
    });
  };

  // 現在のタブに基づいてフィルタリングされた投稿
  const filteredPosts = filterPostsByActiveTab(posts);

  // タブを切り替える関数
  const handleTabChange = (tab: 'feed' | 'reel') => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    // タブ切り替え時にフィルタリングした結果、表示する投稿がない場合は追加データを読み込む
    const filteredPosts = filterPostsByActiveTab(posts);
    if (filteredPosts.length === 0 && nextPageUrl && !hasLoadedAllData && !isLoadingMore) {
      loadMorePosts();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="relative">
      <div className="flex mb-4">
        <button
          type="button"
          className={`flex-1 py-2 ${activeTab === 'feed' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabChange('feed')}
        >
          フィード投稿
        </button>
        <button
          type="button"
          className={`flex-1 py-2 ${activeTab === 'reel' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabChange('reel')}
        >
          リール
        </button>
      </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {isLoadingMore ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
              <p>リールを読み込んでいます...</p>
            </div>
          ) : (
            <>
              {activeTab === 'feed' ? 'フィード投稿' : 'リール'}がありません
              {!hasLoadedAllData && (
                <Button 
                  onClick={loadMorePosts} 
                  variant="outline" 
                  className="mt-4"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      読み込み中...
                    </>
                  ) : (
                    '追加データを読み込む'
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className={`relative cursor-pointer overflow-hidden aspect-square ${
                  selectedPostId === post.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={post.media_product_type === 'FEED' ? post.media_url! : post.thumbnail_url!}
                  alt={`Post from ${post.timestamp}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {/* 日付をPCのみ左上に表示（analyzerと同じスタイル） */}
                <div className="absolute top-2 left-2 hidden sm:block bg-white bg-opacity-80 rounded px-2 py-0.5 text-xs text-gray-700 font-medium">
                  {format(new Date(post.timestamp), 'yy/MM/dd', { locale: ja })}
                </div>
                
                {selectedPostId === post.id && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* 追加読み込み用の要素 */}
          {hasMore && (
            <div 
              ref={loadMoreRef} 
              className="py-4 text-center"
            >
              {isLoadingMore ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="text-sm text-gray-500">スクロールして更に読み込む</div>
              )}
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="py-4 text-center text-sm text-gray-500">
              すべての投稿を読み込みました
            </div>
          )}
        </>
      )}
      
      {/* 次へボタンをスライドイン表示 */}
      <div 
        id="next-button"
        className={`sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 transition-all duration-300
          ${showNextButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
          p-4 sm:pb-4
        `}
      >
        <div className="flex justify-end max-w-full">
          <Button type="button" onClick={onNext} className="flex items-center">
            次へ
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstagramPostList;