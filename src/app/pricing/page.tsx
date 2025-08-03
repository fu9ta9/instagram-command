"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Star,
  Shield,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  Gift,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/landing/LandingHeader";

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
  features: { name: string; included: boolean }[];
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
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
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
              {feature.name}
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

const PricingPage = () => {
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

  const freeFeatures = [
    { name: "競合アカウント分析", included: true }
  ];

  const trialFeatures = [
    { name: "無制限の自動返信設定", included: true },
    { name: "競合アカウント分析", included: true }
  ];

  const proFeatures = [
    { name: "無制限の自動返信設定", included: true },
    { name: "競合アカウント分析", included: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 pt-28 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              シンプル
            </span>
            で明快な<br />料金プラン
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            3つのプランから、あなたのニーズに合ったものをお選びください。
            フリープランから始めて、必要に応じてアップグレードできます。
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="フリープラン"
              price="¥0"
              period="永続無料"
              description="競合分析機能をお試ししたい方向け"
              features={freeFeatures}
              buttonText="分析機能を使う"
              onClick={handleAuth}
              showLoginFree={true}
            />
            
            <PricingCard
              title="トライアルプラン"
              price="¥0"
              period="2週間無料"
              trialInfo="2週間無料トライアル"
              description="すべての機能を2週間無料でお試し"
              features={trialFeatures}
              isPopular={true}
              buttonText="14日間無料トライアルを始める"
              onClick={handleAuth}
            />
            
            <PricingCard
              title="プロプラン"
              price="¥3,980"
              period="/ 月"
              description="Instagram運用を効率化したい方向け"
              features={proFeatures}
              buttonText="トライアルから始める"
              onClick={handleAuth}
            />
          </div>
        </div>
      </section>

      {/* Plan Benefits */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              InstaCommandを選ぶ理由
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              安全で使いやすく、効果的なInstagram運用をサポートします。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "安全性",
                description: "Meta公式APIを使用し、アカウント凍結のリスクゼロ"
              },
              {
                icon: Zap,
                title: "高速",
                description: "リアルタイムでの自動返信で機会損失を防止"
              },
              {
                icon: BarChart3,
                title: "分析力",
                description: "詳細なデータ分析で効果的な運用をサポート"
              },
              {
                icon: Users,
                title: "サポート",
                description: "24時間対応の手厚いカスタマーサポート"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              よくある質問
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "トライアル期間終了後はどうなりますか？",
                a: "トライアル期間終了後は、自動的にフリープランに移行されます。継続してご利用いただく場合も、お客様が明示的にアップグレードするまで課金されることはありません。"
              },
              {
                q: "支払い方法は何が使えますか？",
                a: "Stripeに準拠した決済システムを使用しており、主要なクレジットカード（Visa、MasterCard、American Express等）がご利用いただけます。"
              },
              {
                q: "解約はいつでもできますか？",
                a: "はい、いつでも解約可能です。解約手続きは管理画面から簡単に行うことができ、解約後も現在の課金期間終了まではサービスをご利用いただけます。"
              },
              {
                q: "トライアルはどのように始めればよいですか？",
                a: "決済情報の登録は不要で、ボタン一つで今すぐトライアルを開始できます。面倒な手続きは一切なく、すぐにすべての機能をお試しいただけます。"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              今すぐ無料トライアルを始めませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Googleアカウントで簡単ログイン。、2週間の無料トライアルですべての機能を体験してください。
            </p>
            <Button 
              size="lg" 
              onClick={handleAuth}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4"
            >
              14日間無料トライアルを始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;