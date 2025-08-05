"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AtSign as YenSign, 
  Shield, 
  LogIn, 
  LineChart, 
  Smartphone, 
  Zap,
  MessageCircle,
  BarChart3,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/landing/LandingHeader";

const FeatureCard = ({ icon: Icon, title, description, benefits }: {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="group"
  >
    <Card className="p-8 h-full bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        {description}
      </p>
      
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            {benefit}
          </li>
        ))}
      </ul>
    </Card>
  </motion.div>
);

const FeaturesDetailPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartTrial = () => {
    if (session) {
      router.push("/plan");
    } else {
      signIn('google', { 
        callbackUrl: "/plan",
        redirect: true 
      });
    }
  };

  const features = [
    {
      icon: YenSign,
      title: "リーズナブルな価格設定",
      description: "月額3,980円という手軽な価格で、本格的なInstagram自動返信機能をご利用いただけます。他社の同等サービスと比較して、大幅にコストを削減しました。",
      benefits: [
        "月額3,980円の低価格設定",
        "初期費用・設定費用なし",
        "14日間の無料トライアル",
        "いつでもキャンセル可能"
      ]
    },
    {
      icon: Shield,
      title: "Meta公式API認証済み",
      description: "Meta社の厳格なアプリ審査をクリアした、完全に安全なツールです。非公式ツールとは異なり、アカウント凍結などのリスクを心配することなく、安心してご利用いただけます。",
      benefits: [
        "Meta公式API使用で安全性保証",
        "アカウント凍結リスクゼロ",
        "規約違反の心配なし",
        "継続的なサポート体制"
      ]
    },
    {
      icon: LogIn,
      title: "2ステップの簡単セットアップ",
      description: "Googleアカウントでのログインと、Instagramとの連携だけで完了。面倒なFacebookアカウントの設定や複雑な初期設定は一切不要で、誰でも簡単に始められます。",
      benefits: [
        "Googleアカウントで簡単ログイン",
        "Instagram連携は1クリック",
        "Facebookアカウント不要",
        "5分で利用開始可能"
      ]
    },
    {
      icon: LineChart,
      title: "競合アカウント分析",
      description: "アカウントIDを検索するだけで、投稿情報をいいね数・コメント数付きで一覧表示。いいね数・コメント数でソート可能で、過去の全投稿を確認できます。クリックすると実際のInstagram画面にジャンプし、人気投稿を簡単に見つけて投稿作成の参考にできます。",
      benefits: [
        "アカウントID検索で投稿データ取得",
        "いいね数・コメント数での詳細ソート",
        "過去の全投稿履歴を確認可能",
        "クリックでInstagram画面へ直接ジャンプ",
        "人気投稿の発見と参考資料作成",
        "※非公開アカウントは0件表示"
      ]
    },
    {
      icon: Smartphone,
      title: "完全モバイル対応",
      description: "スマートフォンからでも、すべての機能をフル活用できます。外出先でもInstagramアカウントの管理・分析が可能で、いつでもどこでも効率的な運用ができます。",
      benefits: [
        "スマホで全機能利用可能",
        "レスポンシブデザイン",
        "外出先での操作性抜群",
        "タブレット対応"
      ]
    },
    {
      icon: Zap,
      title: "自動DM返信システム",
      description: "フィード、リール、ストーリー、LIVE中のコメントに対して自動返信を設定できます。テキストとボタンの設置が可能で、キーワードの部分一致・完全一致まで対応。コメントへの返信も可能で、自然さを演出するため3つの文章をランダムに返信します。",
      benefits: [
        "フィード・リール・ストーリー・LIVEコメント対応",
        "テキスト＋ボタン設置機能",
        "キーワード部分一致・完全一致対応",
        "コメントへの直接返信機能",
        "3パターンランダム返信で自然さ演出",
        "24時間365日自動稼働"
      ]
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
            InstaCommandの
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              全機能
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            競合分析から自動返信まで、Instagram運用に必要な機能を網羅。
            Meta公式API認証済みで安全・確実な運用をサポートします。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button size="lg" className="mr-4" onClick={handleStartTrial}>
              14日間無料トライアル
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                使い方を見る
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
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
              プロレベルの機能を手軽に
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              競合アカウント分析と自動DM返信を軸に、Instagram運用を効率化する実用的な機能群。
              月額3,980円で企業レベルのマーケティングツールをご利用いただけます。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
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
              今すぐInstagram運用を始めませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              14日間の無料トライアルで、すべての機能をお試しいただけます。
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
              onClick={handleStartTrial}
            >
              無料トライアルを開始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesDetailPage;