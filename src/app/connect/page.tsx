import ConnectClient from './ConnectClient'
import AppLayout from '@/components/layouts/AppLayout'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'

export default async function ConnectPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <AppLayout>
      <ConnectClient />
    </AppLayout>
  )
} 