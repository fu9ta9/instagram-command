import InstagramPostAnalyzer from "@/components/instagram-post-analyzer"
import AppLayout from '@/components/layouts/AppLayout'
import { getSessionWrapper } from '@/lib/session'
import { redirect } from 'next/navigation'

export const dynamic = "force-dynamic";
export default async function SearchPage() {
  try {
    const session = await getSessionWrapper()

    if (!session?.user) {
      redirect('/auth/signin')
    }

    return (
      <div className="container mx-auto my-6">
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