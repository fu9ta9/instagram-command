import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ReplyRegistrationModal from '@/features/replies/components/ReplyRegistrationModal';
import { MembershipType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Reply, ReplyInput } from '@/features/replies/types/reply.types';

interface ReplyFormProps {
  onReplyAdded: (reply: Reply) => void;
  membershipType: MembershipType;
  onReplyRegistered: () => void;
}

export default function ReplyForm({ onReplyAdded, membershipType, onReplyRegistered }: ReplyFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = async () => {
    if (membershipType === 'FREE') {
      router.push('/plan');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: ReplyInput | Omit<Reply, "id">): Promise<any> => {
    onReplyAdded(data as Reply);
    setIsModalOpen(false);
    onReplyRegistered();
    return Promise.resolve();
  };

  return (
    <div>
      <Button
        onClick={handleOpenModal}
        disabled={membershipType === 'FREE'}
        title={membershipType === 'FREE' ? 'プランをアップグレードして利用可能になります' : ''}
      >
        自動返信を追加
      </Button>
      {error && (
        <div className="mt-2 text-red-600">
          <p>{error}</p>
        </div>
      )}
      <ReplyRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
