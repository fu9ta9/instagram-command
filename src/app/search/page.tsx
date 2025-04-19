import InstagramPostAnalyzer from "@/components/instagram-post-analyzer"
import AppLayout from '@/components/layouts/AppLayout'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function SearchPage() {
  try {
    const session = await getSession()

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
  } catch (error) {
    console.error('Error in SearchPage:', error)
    redirect('/auth/signin')
  }
} 