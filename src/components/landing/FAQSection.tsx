"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const FAQSection = () => {
  const faqs = [
    {
      q: "料金はいくらですか？",
      a: "基本の料金プランは月額3,980円（税込）です。フリープランは永続無料で競合分析機能をご利用いただけます。2週間の無料トライアルで全機能をお試しいただけます。"
    },
    {
      q: "無料トライアル期間終了後はどうなりますか？",
      a: "トライアル期間終了後は、自動的にフリープランに移行されます。継続してご利用いただく場合も、お客様が明示的にアップグレードするまで課金されることはありません。"
    },
    {
      q: "アカウントが凍結される心配はありませんか？",
      a: "Meta公式APIを使用しているため、アカウント凍結のリスクはありません。Meta社の厳格なアプリ審査をクリアした完全に安全なツールです。"
    },
    {
      q: "設定にはどれくらい時間がかかりますか？",
      a: "初回設定は約5分程度で完了します。Googleアカウントでのログインと、Instagram連携を行うだけで利用開始できます。技術的な知識は一切不要です。"
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
      q: "どのような機能が使えますか？",
      a: "競合アカウントの分析、自動DM返信システム、詳細な分析レポート、モバイル対応など、Instagram運用に必要な機能を網羅しています。"
    },
    {
      q: "スマートフォンでも使えますか？",
      a: "はい、スマートフォンからでもすべての機能をフル活用できます。レスポンシブデザインで外出先でもInstagramアカウントの管理・分析が可能です。"
    }
  ];

  return (
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
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            お客様からよくお寄せいただく質問をまとめました。
            不明な点がございましたらお気軽にお問い合わせください。
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-gray-50 dark:bg-gray-700 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;