import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import KeywordRegistrationModal from './KeywordRegistrationModal';

interface KeywordFormProps {
  onKeywordAdded: (data: any) => void;
}

const KeywordForm: React.FC<KeywordFormProps> = ({ onKeywordAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (data: any) => {
    onKeywordAdded(data);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>自動返信登録</Button>
      <KeywordRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default KeywordForm;