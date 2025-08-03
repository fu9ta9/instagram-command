"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Instagram, 
  Settings, 
  MessageCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

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
    className="text-center"
  >
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-white text-xl font-bold">{step}</span>
    </div>
    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </motion.div>
);

const HowItWorksSection = () => {
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

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
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
              4ステップ
            </span>
            で始める<br />Instagram自動化
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            誰でも簡単に始められる、わかりやすいセットアップ手順。
            技術的な知識は一切不要で、5分程度で利用開始できます。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <StepCard key={index} step={index + 1} {...step} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/how-it-works">
            <Button size="lg" variant="outline">
              詳しい手順を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;