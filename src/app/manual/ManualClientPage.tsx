'use client'
import { useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ManualImages } from "./imageList";

const SECTIONS = [
  { key: "login", label: "ログイン" },
  { key: "plan", label: "プラン" },
  { key: "connect", label: "連携" },
  { key: "search", label: "検索" },
  { key: "reply", label: "返信" },
];

type Mode = "pc" | "sp";

const SECTION_CONTENT: Record<string, { title: string; steps: string[] }> = {
  login: {
    title: "ログイン",
    steps: [
      "トップページ右上または「無料トライアルを始める」ボタンからログイン画面へ進みます。",
      "「Googleでログイン」をクリックし、Googleアカウントで認証します。",
      "ログイン後、連携画面に遷移します。"
    ]
  },
  plan: {
    title: "プラン選択",
    steps: [
      "メニューの「プラン」タブを開きます。",
      "新規利用者の方は「トライアル」ボタンをクリックします。",
      "トライアル期間(2週間)が終了すると、PRO会員にアップグレードするボタンが表示されます。"
    ]
  },
  connect: {
    title: "Instagram連携",
    steps: [
      "メニューの「連携」タブを開きます。",
      "「Instagram連携」ボタンをクリックします。",
      "Instagramの認証画面でログインし、「情報を保存」をクリックします。",
      "インスタコマンドとのリンク画面で「許可」をクリックします。",
      "連携が完了すると、アカウント情報が表示されます。"
    ]
  },
  search: {
    title: "アカウント検索",
    steps: [
      "メニューの「検索」タブを開きます。",
      "検索窓にアカウントIDを入力し、検索ボタンを押します。",
      "該当するInstagramアカウントと投稿が一覧で表示されます。",
      "いいね順を押すと、投稿がいいね順でソートされます。",
      "右側のすべてを押すと、過去の投稿を全て取得してソートできます。",
      "気になった投稿はクリックすると、ブラウザのInstagramで投稿が確認できます。",
    ]
  },
  reply: {
    title: "DM自動送信設定",
    steps: [
      "メニューの「返信」タブを開きます。",
      "「新規返信登録」ボタンをクリックします。",
      "案内に従ってキーワードや返信内容を設定し、保存します。",
      "設定後、条件に合致したDMが自動で送信されます。"
    ]
  },
};

export default function ManualClientPage({ images }: { images: ManualImages }) {
  const [selected, setSelected] = useState("login");
  const [mode, setMode] = useState<Mode>("pc");
  const [swiperIndexes, setSwiperIndexes] = useState<Record<string, number>>({
    login: 0, plan: 0, connect: 0, search: 0, reply: 0
  });
  const section = SECTION_CONTENT[selected];
  const imgs = images[selected][mode];

  const swiperRef = useRef<any>(null);

  const handleSectionChange = (key: string) => {
    setSelected(key);
    setSwiperIndexes((prev) => ({ ...prev, [key]: 0 }));
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  };

  return (
    <main className="flex flex-col sm:flex-row min-h-[60vh] max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow sm:mt-8">
      {/* サイド/トップナビ */}
      <nav className="sm:w-48 flex sm:flex-col border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            className={`flex-1 px-3 py-3 text-center sm:text-base text-xs font-medium transition-colors
              ${selected === section.key ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
              ${selected === section.key ? "border-b-2 sm:border-b-0 sm:border-l-4 border-blue-500" : ""}
            `}
            onClick={() => handleSectionChange(section.key)}
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
          <div className="w-full max-w-xl relative">
            {/* 左矢印 */}
            <button
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 p-2 rounded-full bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 hover:bg-gray-300/90 dark:hover:bg-gray-600/90 transition disabled:opacity-50"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={imgs.length === 0}
              aria-label="前へ"
              style={{ pointerEvents: imgs.length === 0 ? 'none' : 'auto' }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 右矢印 */}
            <button
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 p-2 rounded-full bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 hover:bg-gray-300/90 dark:hover:bg-gray-600/90 transition disabled:opacity-50"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={imgs.length === 0}
              aria-label="次へ"
              style={{ pointerEvents: imgs.length === 0 ? 'none' : 'auto' }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={false}
              loop={true}
              modules={[Pagination, Navigation]}
              onSlideChange={(swiper) => {
                setSwiperIndexes((prev) => ({
                  ...prev,
                  [selected]: swiper.realIndex
                }));
              }}
              initialSlide={swiperIndexes[selected]}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              key={selected + mode}
            >
              {imgs.length === 0 ? (
                <div className="text-center text-gray-400 py-12">画像がありません</div>
              ) : (
                imgs.map((img, idx) => (
                  <SwiperSlide key={img.src}>
                    {mode === "pc" ? (
                      <div className="flex justify-center items-center h-[400px]">
                        <Image
                          src={img.src}
                          alt={img.alt || `${section.title}の画像${idx+1}`}
                          width={600}
                          height={400}
                          className="rounded border shadow object-contain"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="relative w-full max-w-[320px] aspect-[9/16] mx-auto">
                        <Image
                          src={img.src}
                          alt={img.alt || `${section.title}の画像${idx+1}`}
                          fill
                          className="rounded border shadow object-contain"
                          priority
                          sizes="(max-width: 320px) 100vw, 320px"
                        />
                      </div>
                    )}
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