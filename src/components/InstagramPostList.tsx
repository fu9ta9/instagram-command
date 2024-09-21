import React, { useState } from 'react';
import Image from 'next/image';
import { mockInstagramPosts } from '@/lib/mockInstagramData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface InstagramPost {
  id: string;
  media_url: string;
  thumbnail_url: string;
  timestamp: string;
  media_type: string;  // 'IMAGE' | 'VIDEO' の代わりに string を使用
}

interface InstagramPostListProps {
  onSelectPost: (post: InstagramPost) => void;
}

const InstagramPostList: React.FC<InstagramPostListProps> = ({ onSelectPost }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'reel'>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePostClick = (post: InstagramPost) => {
    setSelectedPostId(post.id);
    onSelectPost(post);
  };

  const filteredPosts = mockInstagramPosts.filter(post => 
    activeTab === 'feed' ? post.media_type === 'IMAGE' : post.media_type === 'VIDEO'
  );

  return (
    <div>
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
      <div className="grid grid-cols-3 gap-1">
        {filteredPosts.map((post) => (
          <div 
            key={post.id} 
            className={`relative cursor-pointer overflow-hidden ${
              selectedPostId === post.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => handlePostClick(post)}
          >
            <Image
              src={post.thumbnail_url}
              alt={`Post from ${post.timestamp}`}
              width={150}
              height={150}
              layout="responsive"
            />
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
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
    </div>
  );
};

export default InstagramPostList;