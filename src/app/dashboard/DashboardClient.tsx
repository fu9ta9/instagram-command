'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const router = useRouter()
  const { data: session, status } = useSession()

  console.log('Session status:', status)
  console.log('Session data:', session)

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user?.name}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}