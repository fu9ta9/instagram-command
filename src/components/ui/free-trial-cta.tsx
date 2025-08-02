"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, ArrowRight, Sparkles } from "lucide-react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface FreeTrialCTAProps {
  className?: string
}

export function FreeTrialCTA({ className = "" }: FreeTrialCTAProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignUp = () => {
    if (session) {
      router.push("/plan")
    } else {
      signIn('google', { 
        callbackUrl: "/plan",
        redirect: true 
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 border-0 shadow-2xl">
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <CardContent className="relative p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">!</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-2">
                無料でDM自動返信を試しませんか？
              </h3>
              <p className="text-blue-100 mb-4">
                検索機能を体験したら、次は<span className="font-semibold text-white">自動返信</span>でエンゲージメント最大化！有益な情報をすぐにお届けできます
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Gift className="h-4 w-4 text-yellow-300 mr-2" />
                  <span className="text-white font-semibold text-sm">14日間完全無料</span>
                </div>
                
                <Button 
                  onClick={handleSignUp}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  今すぐ試す
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}