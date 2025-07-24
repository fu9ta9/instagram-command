import AppLayout from '@/components/layouts/AppLayout'
import { getSessionWrapper } from '@/lib/session'
import { redirect } from 'next/navigation'
import PlanClient from '../components/PlanClient'

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  try {
    const session = await getSessionWrapper()

    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <AppLayout>
        <PlanClient />
      </AppLayout>
    )
  } catch (error) {
    console.error('Error in SubscriptionPage:', error)
    redirect('/auth/signin')
  }
}