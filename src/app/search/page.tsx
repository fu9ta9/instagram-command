import InstagramPostAnalyzer from "@/components/instagram-post-analyzer"
import AppLayout from '@/components/layouts/AppLayout'
import { getSessionWrapper } from '@/lib/session'

export const dynamic = "force-dynamic";
export default async function SearchPage() {
  try {
    const session = await getSessionWrapper()
    const isLoggedIn = !!session?.user

    return (
      <div className="container mx-auto my-6">
        <AppLayout>
          <InstagramPostAnalyzer isLoggedIn={isLoggedIn} />
        </AppLayout>
      </div>
    )
  } catch (error) {
    console.error('Error in SearchPage:', error)
    return (
      <div className="container mx-auto my-6">
        <AppLayout>
          <InstagramPostAnalyzer isLoggedIn={false} />
        </AppLayout>
      </div>
    )
  }
} 