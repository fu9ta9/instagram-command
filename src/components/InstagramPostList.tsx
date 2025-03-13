import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  useEffect(() => {
    if (initialSelectedPostId) {
      setSelectedPostId(initialSelectedPostId);
      setShowNextButton(true);
    }
  }, [initialSelectedPostId]);

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

  const fetchInstagramPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/instagram/posts');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.error === 'Instagram business account not found') {
          setError(data.message);
        } else {
          setError(data.message || '投稿の取得に失敗しました');
        }
        return;
      }

      setPosts(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('投稿の取得中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (post: InstagramPost) => {
    if (selectedPostId === post.id) return;
    
    setSelectedPostId(post.id);
    onSelectPost(post);
    setShowNextButton(true);
    
    // 投稿選択時に次へボタンが見えるようにスクロール
    setTimeout(() => {
      const nextButton = document.getElementById('next-button');
      if (nextButton) {
        nextButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // media_typeに基づいてフィルタリング
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'feed') {
      return post.media_product_type === 'FEED' || 
             (post.media_type && ['IMAGE', 'CAROUSEL_ALBUM'].includes(post.media_type));
    } else {
      return post.media_product_type === 'REELS' || 
             (post.media_type && post.media_type === 'VIDEO' && post.media_product_type !== 'FEED');
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="relative">
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 ${activeTab === 'feed' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          フィード投稿
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'reel' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('reel')}
        >
          リール
        </button>
      </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {activeTab === 'feed' ? 'フィード投稿' : 'リール'}がありません
        </div>
      ) : (
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
              />
              {/* 日付を楕円形で右上に表示 */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {format(new Date(post.timestamp), 'MM/dd', { locale: ja })}
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
      )}
      
      {/* 次へボタンをスライドイン表示 */}
      <div 
        id="next-button"
        className={`sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 transition-all duration-300 ${
          showNextButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
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