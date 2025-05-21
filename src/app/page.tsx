import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, MessageCircle } from "lucide-react"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeatureSection"

export default function LandingPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      {/* 他のセクションも同様に追加 */}
    </main>
  )
}