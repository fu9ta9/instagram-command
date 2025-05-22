'use client'
import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ManualImages } from "./imageList";

const SECTIONS = [
  { key: "login", label: "ログイン" },
  { key: "connect", label: "Instagram連携" },
  { key: "search", label: "アカウント検索" },
  { key: "reply", label: "DM自動送信設定" },
];

type Mode = "pc" | "sp";

const SECTION_CONTENT: Record<string, { title: string; steps: string[] }> = {
  login: {
    title: "ログイン",
    steps: [
      "トップページ右上または「無料トライアルを始める」ボタンからログイン画面へ進みます。",
      "「Googleでログイン」をクリックし、Googleアカウントで認証します。",
      "ログイン後、管理画面に遷移します。"
    ]
  },
  connect: {
    title: "Instagram連携",
    steps: [
      "管理画面の「連携」タブを開きます。",
      "「Instagramアカウントを連携」ボタンをクリックします。",
      "Instagramの認証画面でログインし、許可を与えます。",
      "連携が完了すると、アカウント情報が表示されます。"
    ]
  },
  search: {
    title: "アカウント検索",
    steps: [
      "「検索」タブを開きます。",
      "検索窓にキーワードやユーザー名を入力し、検索ボタンを押します。",
      "該当するInstagramアカウントが一覧で表示されます。",
      "詳細を見たい場合はアカウントをクリックします。"
    ]
  },
  reply: {
    title: "DM自動送信設定",
    steps: [
      "「返信」タブを開きます。",
      "「新規返信登録」ボタンをクリックします。",
      "案内に従ってキーワードや返信内容を設定し、保存します。",
      "設定後、条件に合致したDMが自動で送信されます。"
    ]
  },
};

export default function ManualClientPage({ images }: { images: ManualImages }) {
  const [selected, setSelected] = useState("login");
  const [mode, setMode] = useState<Mode>("pc");
  const section = SECTION_CONTENT[selected];
  const imgs = images[selected][mode];

  return (
    <main className="flex flex-col sm:flex-row min-h-[60vh] max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow mt-8">
      {/* サイド/トップナビ */}
      <nav className="sm:w-48 flex sm:flex-col border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            className={`flex-1 px-4 py-3 text-left sm:text-base text-sm font-medium transition-colors
              ${selected === section.key ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
              ${selected === section.key ? "border-b-2 sm:border-b-0 sm:border-l-4 border-blue-500" : ""}
            `}
            onClick={() => setSelected(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {/* 内容 */}
      <section className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{section.title}</h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded border text-sm ${mode === "pc" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
              onClick={() => setMode("pc")}
            >PC画面</button>
            <button
              className={`px-3 py-1 rounded border text-sm ${mode === "sp" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
              onClick={() => setMode("sp")}
            >SP画面</button>
          </div>
        </div>
        <ol className="list-decimal ml-5 space-y-1 mb-4">
          {section.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              modules={[Pagination, Navigation]}
            >
              {imgs.length === 0 ? (
                <div className="text-center text-gray-400 py-12">画像がありません</div>
              ) : (
                imgs.map((img, idx) => (
                  <SwiperSlide key={img.src}>
                    <Image
                      src={img.src}
                      alt={img.alt || `${section.title}の画像${idx+1}`}
                      width={mode === "pc" ? 600 : 300}
                      height={400}
                      className={`rounded border shadow object-contain ${mode === "pc" ? "w-[600px] h-[400px]" : "w-[300px] h-[400px]"}`}
                      priority
                    />
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </div>
      </section>
    </main>
  );
} 