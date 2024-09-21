import React from 'react';

interface Keyword {
  id: string;
  keyword: string;
  reply: string;
  postImage: string;
}

interface KeywordListProps {
  keywords: Keyword[];
  onKeywordDeleted: (id: string) => void;
}

const KeywordList: React.FC<KeywordListProps> = ({ keywords, onKeywordDeleted }) => {
  return (
    <div className="space-y-4">
      {keywords.map((keyword) => (
        <div key={keyword.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
          <img src={keyword.postImage} alt="Post" className="w-16 h-16 object-cover rounded" />
          <div className="flex-grow">
            <p className="font-bold">{keyword.keyword}</p>
            <p className="text-sm text-gray-600">{keyword.reply}</p>
          </div>
          <button
            onClick={() => onKeywordDeleted(keyword.id)}
            className="text-red-500 hover:text-red-700"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
};

export default KeywordList;