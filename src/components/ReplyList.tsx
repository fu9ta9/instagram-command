import React from 'react';

interface Reply {
  id: string;
  keyword: string;
  reply: string;
  postImage: string;
}

interface ReplyListProps {
  replies: Reply[];
  onReplyDeleted: (id: string) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, onReplyDeleted }) => {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <div key={reply.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
          <img src={reply.postImage} alt="Post" className="w-16 h-16 object-cover rounded" />
          <div className="flex-grow">
            <p className="font-bold">{reply.keyword}</p>
            <p className="text-sm text-gray-600">{reply.reply}</p>
          </div>
          <button
            onClick={() => onReplyDeleted(reply.id)}
            className="text-red-500 hover:text-red-700"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReplyList;
