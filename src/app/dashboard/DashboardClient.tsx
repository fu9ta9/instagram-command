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
      fetchConnectionStatus();
    }
  }, [status, session?.user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/connections/status');
      if (response.ok) {
        const data = await response.json();
        // setConnectionStatus(data);
      }
    } catch (error) {
      console.error('連携状態の取得に失敗:', error);
    }
  };

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
      {/* ダッシュボードの内容 */}
    </div>
  );
}