// src/components/DMPreview.tsx
import React from 'react';

interface DMPreviewProps {
  content: string;
  urlButton?: { text: string; url: string } | null;
}

const DMPreview: React.FC<DMPreviewProps> = ({ content, urlButton }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold mb-2">プレビュー:</h3>
      <div className="bg-white rounded-lg p-3 mb-2">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      {urlButton && (
        <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-full cursor-pointer hover:bg-blue-600">
          {urlButton.text}
        </div>
      )}
    </div>
  );
};

export default DMPreview;