"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoModal } from "@/components/ui/video-modal";
import { 
  UserPlus, 
  Instagram, 
  Settings, 
  MessageCircle,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play
} from "lucide-react";
import Link from "next/link";
import LandingHeader from "@/components/landing/LandingHeader";

const StepCard = ({ step, icon: Icon, title, description }: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: step * 0.1 }}
    viewport={{ once: true }}
    className="relative"
  >
    <Card className="p-8 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* 左側：コンテンツ */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {step}
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* 右側：画像エリア */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">画像エリア</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    
    {step < 4 && (
      <div className="hidden lg:block absolute -bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="w-px h-16 bg-gradient-to-b from-blue-500 to-purple-600"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-1.5"></div>
      </div>
    )}
  </motion.div>
);

const FeatureHighlight = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </motion.div>
);

const HowItWorksPage = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  
  const handleStartTrial = () => {
    window.location.href = '/';
  };

  const handleVideoPlay = () => {
    setIsVideoModalOpen(true)
  };

  // デモ動画のURL（実際の動画URLに置き換えてください）
  const demoVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // 例：YouTube URL

  const steps = [
    {
      icon: UserPlus,
      title: "アカウント作成",
      description: "Googleアカウントで簡単に登録。面倒な入力項目はありません。"
    },
    {
      icon: Instagram,
      title: "Instagram連携",
      description: "あなたのInstagramアカウントを安全に連携します。"
    },
    {
      icon: Settings,
      title: "自動返信設定",
      description: "キーワードに応じた返信内容を設定します。"
    },
    {
      icon: MessageCircle,
      title: "自動返信開始",
      description: "設定完了後、24時間自動で返信が開始されます。"
    }
  ];

  const highlights = [
    {
      icon: CheckCircle,
      title: "簡単セットアップ",
      description: "5分程度で設定完了。技術的な知識は不要です。"
    },
    {
      icon: Settings,
      title: "柔軟なカスタマイズ",
      description: "あなたのビジネスに合わせた返信内容を設定できます。"
    },
    {
      icon: BarChart3,
      title: "データドリブン",
      description: "詳細な分析データで効果を可視化します。"
    }
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
              4ステップ
            </span>
            で始める<br />Instagram自動化
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            誰でも簡単に始められる、わかりやすいセットアップ手順。
            技術的な知識は一切不要で、5分程度で利用開始できます。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/">
              <Button size="lg">
                今すぐ無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleVideoPlay}>
              <Play className="mr-2 h-5 w-5" />
              デモ動画を見る
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              セットアップ手順
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              以下の4ステップで、Instagram自動返信システムが利用開始できます。
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <StepCard key={index} step={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
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
              なぜInstaCommandが選ばれるのか
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              使いやすさと機能性を両立した、最適なInstagram運用ツールです。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {highlights.map((highlight, index) => (
              <FeatureHighlight key={index} {...highlight} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
                q: "設定にはどれくらい時間がかかりますか？",
                a: "初回設定は約5分程度で完了します。Googleアカウントでのログインと、Instagram連携を行うだけで利用開始できます。"
              },
              {
                q: "技術的な知識は必要ですか？",
                a: "いいえ、技術的な知識は一切不要です。直感的な操作画面で、誰でも簡単に設定できます。"
              },
              {
                q: "Instagramアカウントが凍結される心配はありませんか？",
                a: "Meta公式APIを使用しているため、アカウント凍結のリスクはありません。安心してご利用ください。"
              },
              {
                q: "返信内容は自由に設定できますか？",
                a: "はい、キーワードに応じた返信内容を自由にカスタマイズできます。ビジネス用途からカジュアルな対応まで対応可能です。"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-white dark:bg-gray-800">
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
              今すぐ始めて、Instagram運用を効率化しませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              14日間の無料トライアルで、すべての機能をお試しいただけます。
            </p>
            <Link href="/">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
              >
                14日間無料トライアルを開始
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 動画モーダル */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={demoVideoUrl}
        title="InstaCommand デモ動画"
      />
    </div>
  );
};

export default HowItWorksPage;