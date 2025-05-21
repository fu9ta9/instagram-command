import AppLayout from '@/components/layouts/AppLayout'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ReplyClient from './ReplyClient'

export const dynamic = "force-dynamic";

export default async function ReplyPage() {
  try {
    const session = await getSession()

    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <AppLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">DM自動返信設定</h1>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <ReplyClient />
          </div>
        </div>
      </AppLayout>
    )
  } catch (error) {
    console.error('Error in ReplyPage:', error)
    redirect('/auth/signin')
  }
} 