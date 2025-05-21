import AppLayout from '@/components/layouts/AppLayout'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import PlanClient from './PlanClient'

export const dynamic = "force-dynamic";
export default async function PlanPage() {
  try {
    const session = await getSession()

    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <AppLayout>
        <PlanClient />
      </AppLayout>
    )
  } catch (error) {
    console.error('Error in PlanPage:', error)
    redirect('/auth/signin')
  }
} 