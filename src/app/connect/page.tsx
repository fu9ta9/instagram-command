import ConnectClient from './ConnectClient'
import AppLayout from '@/components/layouts/AppLayout'
import { getSessionWrapper } from '@/lib/session'
import { redirect } from 'next/navigation'

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  try {
    const session = await getSessionWrapper()
    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <AppLayout>
        <ConnectClient />
      </AppLayout>
    )
  } catch (error) {
    console.error('Error in ConnectPage:', error)
    redirect('/auth/signin')
  }
} 