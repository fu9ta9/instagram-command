"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Star,
  ArrowRight
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PricingCard = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  isPopular = false,
  buttonText,
  onClick,
  trialInfo,
  showLoginFree = false
}: {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  onClick: () => void;
  trialInfo?: string;
  showLoginFree?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className={`relative ${isPopular ? 'lg:scale-105 lg:z-10' : ''}`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
          <Star className="w-4 h-4 mr-2" />
          おすすめ
        </div>
      </div>
    )}
    
    <Card className={`p-8 h-full bg-white dark:bg-gray-800 border-2 transition-all duration-300 hover:shadow-xl flex flex-col ${
      isPopular 
        ? 'border-blue-500 shadow-lg' 
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
    }`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {trialInfo && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {trialInfo}
          </div>
        )}
        <div className="mb-4">
          <span className="text-4xl font-black text-gray-900 dark:text-white">
            {price}
          </span>
          <span className="text-lg text-gray-600 dark:text-gray-300 ml-1">
            {period}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-900 dark:text-white">
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      {showLoginFree && (
        <div className="text-center mb-4">
          <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold relative">
            ログイン不要
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
          </div>
        </div>
      )}
      
      <Button 
        onClick={onClick}
        className={`w-full mt-auto ${
          isPopular 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
            : 'bg-gray-900 hover:bg-gray-700'
        }`}
        size="lg"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  </motion.div>
);

const PricingSectionHome = () => {
  const { data: session } = useSession();
  const router = useRouter();

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

  const handleFreeAnalysis = () => {
    router.push("/search");
  };

  const plans = [
    {
      title: "フリープラン",
      price: "¥0",
      period: "永続無料",
      description: "競合分析機能をお試ししたい方向け",
      features: ["競合アカウント分析"],
      buttonText: "分析機能を使う",
      showLoginFree: true
    },
    {
      title: "トライアルプラン",
      price: "¥0",
      period: "2週間無料",
      trialInfo: "2週間無料トライアル",
      description: "すべての機能を2週間無料でお試し",
      features: ["無制限の自動返信設定", "競合アカウント分析"],
      buttonText: "14日間無料トライアルを始める",
      isPopular: true
    },
    {
      title: "プロプラン",
      price: "¥3,980",
      period: "/ 月",
      description: "Instagram運用を効率化したい方向け",
      features: ["無制限の自動返信設定", "競合アカウント分析"],
      buttonText: "トライアルから始める"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              シンプル
            </span>
            で明快な<br />料金プラン
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            3つのプランから、あなたのニーズに合ったものをお選びください。
            フリープランから始めて、必要に応じてアップグレードできます。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              onClick={index === 0 ? handleFreeAnalysis : handleAuth}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              料金プランの詳細を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSectionHome;