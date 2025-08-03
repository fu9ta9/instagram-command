import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeatureSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import PricingSectionHome from "@/components/landing/PricingSection"
import FAQSection from "@/components/landing/FAQSection"
import Footer from "@/components/Footer"

export default function LandingPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSectionHome />
      <FAQSection />
      <Footer />
    </main>
  )
}