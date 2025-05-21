"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Instagram, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartTrial = () => {
    if (session) {
      router.push("/plan");
    } else {
      signIn(undefined, { callbackUrl: "/plan" });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-70" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[50%] rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-60" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <Instagram className="w-8 h-8" />
            <span>InstaCommand</span>
          </motion.div>
          
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-8"
          >
            <li><a href="#features" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">機能紹介</a></li>
            <li><a href="#how-it-works" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">使い方</a></li>
            <li><a href="#pricing" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">料金プラン</a></li>
            {/* <li><a href="#testimonials" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">お客様の声</a></li> */}
          </motion.ul>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <Button variant="outline" className="hidden md:inline-flex" onClick={() => signIn()}>
              ログイン
            </Button>
            <Button onClick={handleStartTrial}>無料で始める</Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            <span className="block">お手軽価格で</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Instagram自動返信
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto md:mx-0"
          >
            「高すぎる…」と感じていた自動返信ツールを、月額3,980円で。
            必要十分な機能を、誰でも手軽に・スマートフォンからもご利用いただけます。
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto" onClick={handleStartTrial}>
              無料トライアルを始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8,
            delay: 0.3,
            type: "spring",
            stiffness: 100
          }}
          className="mt-12 md:mt-0 md:w-1/2 relative"
        >
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-center flex-grow text-sm font-medium text-gray-600 dark:text-gray-300">
                InstagramのDM
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Instagram className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      商品の海外発送は可能でしょうか？配送料金を教えていただけますか？
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @customer · 2分前
                    </p>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start justify-end"
                >
                  <div className="mr-4 bg-blue-500 p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                    <p className="text-sm text-white">
                      はい、海外発送も承っております！配送料金は地域によって異なりますが、通常7-14日程度でお届け可能です。具体的な料金をお知りになりたい場合は、お届け先の国名を教えていただけますでしょうか？
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-blue-100">
                        @InstaChatBot · たった今
                      </p>
                      <Bot className="h-3 w-3 text-blue-100" />
                    </div>
                  </div>
                  <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-full">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex justify-center"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 px-3 rounded-full text-xs text-blue-700 dark:text-blue-300 flex items-center">
                    <Bot className="h-3 w-3 mr-1" />
                    0.3秒で自動応答
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-[20%] right-[-5%] w-24 h-24 bg-yellow-200 dark:bg-yellow-500/20 rounded-full blur-xl opacity-70" />
          <div className="absolute bottom-[10%] left-[10%] w-16 h-16 bg-purple-200 dark:bg-purple-500/20 rounded-full blur-xl opacity-70" />
        </motion.div>
      </div>
      
      {/* Gradient separator */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent" />
    </div>
  );
};

export default HeroSection;