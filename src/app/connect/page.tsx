import ConnectClient from './ConnectClient'
import AppLayout from '@/components/layouts/AppLayout'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ConnectPage() {
  try {
    const session = await getSession()

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