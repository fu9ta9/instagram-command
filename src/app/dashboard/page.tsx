import AppLayout from '@/components/layouts/AppLayout'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  try {
    const session = await getSession()

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
