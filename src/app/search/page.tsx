import InstagramPostAnalyzer from "@/components/instagram-post-analyzer"
import AppLayout from '@/components/layouts/AppLayout'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'

export default async function SearchPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6">
      <AppLayout>
        <InstagramPostAnalyzer />
      </AppLayout>
    </div>
  )
} 