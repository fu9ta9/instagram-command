import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ReplyRegistrationModal from '@/components/ReplyRegistrationModal';
import { MembershipType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface ReplyFormProps {
  onReplyAdded: (data: any) => void;
  membershipType: MembershipType;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onReplyAdded, membershipType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = async () => {
    if (membershipType === MembershipType.FREE) {
      setError("この機能を利用するには、会員プランのアップグレードが必要です。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/member-ship', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('会員種別の確認に失敗しました');
      }

      const data = await response.json();

      if (data.membershipType === MembershipType.FREE) {
        setError("会員プランの有効期限が切れています。会員プランをアップグレードしてください。");
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      setError('エラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    onReplyAdded(data);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpenModal} disabled={isLoading || membershipType === MembershipType.FREE}>
        {isLoading ? '読み込み中...' : '自動返信登録'}
      </Button>
      {error && (
        <div className="mt-2 text-red-600">
          <p>{error}</p>
          <Button onClick={() => router.push('/membership-upgrade')} className="mt-2">
            会員プランをアップグレード
          </Button>
        </div>
      )}
      <ReplyRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ReplyForm;
