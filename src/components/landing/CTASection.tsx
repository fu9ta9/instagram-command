"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const CTASection = () => {
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

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 lg:mb-8 tracking-tight">
            Instagram運用が、<br />もっと自由になる
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mb-10 lg:mb-12 leading-relaxed">
            自動返信で時間を節約し、分析機能でより良いコンテンツを作成。<br />
            あなたのInstagramアカウントを次のレベルへ。
          </p>
          <Button 
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            onClick={handleStartTrial}
          >
            今すぐ始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;