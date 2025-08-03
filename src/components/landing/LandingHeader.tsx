"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = () => {
    if (session) {
      router.push("/plan");
    } else {
      signIn('google', { 
        callbackUrl: "/plan",
        redirect: true 
      });
    }
  };

  const handleLogin = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn('google', { 
        callbackUrl: "/dashboard",
        redirect: true 
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-xl shadow-lg' 
          : 'bg-white/95 backdrop-blur-xl'
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-2xl font-bold text-primary"
        >
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/icon.svg" 
              alt="InstaCommand Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8"
            />
            <span>InstaCommand</span>
          </Link>
        </motion.div>
        
        <motion.ul 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-8"
        >
          <li>
            <Link 
              href="/features" 
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              機能紹介
            </Link>
          </li>
          <li>
            <Link 
              href="/how-it-works" 
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              使い方
            </Link>
          </li>
          <li>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              料金プラン
            </Link>
          </li>
        </motion.ul>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button 
            variant="outline" 
            className="hidden md:inline-flex"
            onClick={handleLogin}
          >
            ログイン
          </Button>
          <Button onClick={handleAuth}>
            無料で始める
          </Button>
        </motion.div>
      </nav>
    </header>
  );
};

export default LandingHeader;