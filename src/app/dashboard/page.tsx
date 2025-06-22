import AppLayout from '@/components/layouts/AppLayout'
import { getSessionWrapper } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  try {
    const session = await getSessionWrapper()

    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <AppLayout>
        <DashboardClient />
      </AppLayout>
    )
  } catch (error) {
    console.error('Error in DashboardPage:', error)
    redirect('/auth/signin')
  }
}
