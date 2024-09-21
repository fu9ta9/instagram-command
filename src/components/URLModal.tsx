// src/components/URLModal.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from './Modal';

interface URLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, url: string) => void;
}

const URLModal: React.FC<URLModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [buttonText, setButtonText] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(buttonText, url);
    setButtonText('');
    setUrl('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="ボタンテキスト"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          required
        />
        <Input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit">追加</Button>
      </form>
    </Modal>
  );
};

export default URLModal;