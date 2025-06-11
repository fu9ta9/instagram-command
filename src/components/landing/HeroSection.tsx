"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Instagram, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroSection = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartTrial = () => {
    if (session) {
      router.push("/connect");
    } else {
      signIn('google', { callbackUrl: "/connect" });
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
            <Button variant="outline" className="hidden md:inline-flex" onClick={() => signIn('google', { callbackUrl: "/connect" })}>
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.3,
            type: "spring",
            stiffness: 100
          }}
          className="mt-12 md:mt-0 md:w-1/2 relative flex justify-center items-center"
        >
          <Image
            src="/hero.webp"
            alt="アプリのイメージ"
            width={2400}
            height={1600}
            priority
          />
        </motion.div>
      </div>
      
      {/* Gradient separator */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent" />
    </div>
  );
};

export default HeroSection;