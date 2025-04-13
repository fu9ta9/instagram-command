'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MembershipType } from "@prisma/client"

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const [membershipType, setMembershipType] = useState<MembershipType>('FREE');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchMembershipType();
    }
  }, [status, session?.user?.id]);

  const fetchMembershipType = async () => {
    try {
      const response = await fetch(`/api/membership/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMembershipType(data.membershipType);
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      {session?.user?.instagram && (
        <div className="mb-4">
          <p>Instagram連携状態: {session.user.instagram.id ? '連携中' : '未連携'}</p>
          {session.user.instagram.id && (
            <p>アカウント名: {session.user.instagram.name}</p>
          )}
        </div>
      )}
    </div>
  );
}