"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AtSign as YenSign, LineChart, Smartphone, LogIn, Shield } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Card className="p-6 h-full bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-start gap-4">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Card>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: YenSign,
      title: "リーズナブルな価格",
      description: "月額3,980円で始められる手軽な価格設定。必要最小限の機能に絞ることで、コストを抑えながら効果的な運用が可能です。",
    },
    {
      icon: Shield,
      title: "Meta公式API使用",
      description: "Meta社が公開しているDM送信機能を、アプリ審査に合格した上で使用。アカウント凍結などのリスクなく、安全に運用できます。",
    },
    {
      icon: LogIn,
      title: "簡単セットアップ",
      description: "Googleアカウントでログインし、Instagramと連携するだけの2ステップ。Facebookアカウントなどのその他のアカウントは不要です。",
    },
    {
      icon: LineChart,
      title: "投稿分析機能",
      description: "競合アカウントの投稿を「いいね数」「コメント数」で詳細に分析。全ての投稿を対象に、効果的なコンテンツ戦略を立てることができます。",
    },
    {
      icon: Smartphone,
      title: "スマートフォン対応",
      description: "スマートフォンからでも簡単に操作可能。外出先でもInstagramアカウントの管理や分析が行えます。",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            注目の<span className="text-blue-600 dark:text-blue-400">5つの特徴</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            InstaCommandは、手軽な価格で始められる分析機能付きのチャットボットです。
            スマートフォンからも簡単に操作できる、使いやすさを重視したサービスです。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;