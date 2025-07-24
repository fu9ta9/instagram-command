'use client'
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ManualImages } from "../types/manual.types";

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
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  
  const section = SECTION_CONTENT[selected];
  const imgs = images[selected][mode];
  const swiperRef = useRef<any>(null);

  // 画像の事前読み込み
  useEffect(() => {
    const preloadImages = async () => {
      const currentImages = images[selected][mode];
      const imagesToPreload = currentImages.slice(0, 3); // 最初の3枚を事前読み込み
      
      imagesToPreload.forEach((img) => {
        if (!preloadedImages.has(img.src)) {
          const imageElement = new window.Image();
          imageElement.onload = () => {
            setPreloadedImages(prev => new Set(prev).add(img.src));
          };
          imageElement.src = img.src;
        }
      });
    };

    preloadImages();
  }, [selected, mode, images, preloadedImages]);

  // 隣接するセクションの画像も事前読み込み
  useEffect(() => {
    const preloadAdjacentImages = () => {
      const currentIndex = SECTIONS.findIndex(s => s.key === selected);
      const adjacentSections = [
        SECTIONS[currentIndex - 1]?.key,
        SECTIONS[currentIndex + 1]?.key
      ].filter(Boolean);

      adjacentSections.forEach(sectionKey => {
        if (sectionKey && images[sectionKey]) {
          const adjacentImages = images[sectionKey][mode];
          adjacentImages.slice(0, 2).forEach((img) => {
            if (!preloadedImages.has(img.src)) {
              const imageElement = new window.Image();
              imageElement.onload = () => {
                setPreloadedImages(prev => new Set(prev).add(img.src));
              };
              imageElement.src = img.src;
            }
          });
        }
      });
    };

    const timeoutId = setTimeout(preloadAdjacentImages, 500);
    return () => clearTimeout(timeoutId);
  }, [selected, mode, images, preloadedImages]);

  const handleSectionChange = (key: string) => {
    setSelected(key);
    setSwiperIndexes((prev) => ({ ...prev, [key]: 0 }));
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  };

  const handleImageLoad = (src: string) => {
    setImageLoadingStates(prev => ({ ...prev, [src]: false }));
  };

  const handleImageLoadStart = (src: string) => {
    setImageLoadingStates(prev => ({ ...prev, [src]: true }));
  };

  return (
    <main className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow mt-8 overflow-hidden">
      {/* ヘッダー部分 - PC/SP切り替えとセクション選択 */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        {/* PC/SP切り替えボタン */}
        <div className="flex justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-sm">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "pc" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setMode("pc")}
            >
              PC画面
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "sp" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setMode("sp")}
            >
              スマホ画面
            </button>
          </div>
        </div>
        
        {/* セクション選択タブ */}
        <nav className="flex overflow-x-auto">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors relative ${
                selected === section.key 
                  ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900" 
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleSectionChange(section.key)}
            >
              {section.label}
              {selected === section.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* コンテンツ部分 */}
      <div className="p-6">
        {/* セクションタイトル */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {mode === "pc" ? "PC画面での操作手順" : "スマホ画面での操作手順"}
          </div>
        </div>

        {/* 手順説明 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">操作手順</h3>
          <ol className="list-decimal ml-5 space-y-2 text-gray-700 dark:text-gray-300">
            {section.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>

        {/* 画像スライダー */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl relative">
            {/* 左矢印 */}
            <button
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg disabled:opacity-50"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={imgs.length === 0}
              aria-label="前へ"
              style={{ pointerEvents: imgs.length === 0 ? 'none' : 'auto' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* 右矢印 */}
            <button
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg disabled:opacity-50"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={imgs.length === 0}
              aria-label="次へ"
              style={{ pointerEvents: imgs.length === 0 ? 'none' : 'auto' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ 
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-blue-600 dark:!bg-blue-400',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600 dark:!bg-blue-400'
              }}
              navigation={false}
              loop={imgs.length > 1}
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
              className="rounded-lg overflow-hidden"
            >
              {imgs.length === 0 ? (
                <div className="text-center text-gray-400 py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg mb-2">📷</div>
                  <div>画像がありません</div>
                </div>
              ) : (
                imgs.map((img, idx) => (
                  <SwiperSlide key={img.src}>
                    {mode === "pc" ? (
                      <div className="flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative" style={{ minHeight: '500px' }}>
                        {imageLoadingStates[img.src] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <Image
                          src={img.src}
                          alt={img.alt || `${section.title}の画像${idx+1}`}
                          width={800}
                          height={500}
                          className="rounded-lg border shadow-sm object-contain max-h-[500px]"
                          priority={idx === 0}
                          loading={idx === 0 ? "eager" : "lazy"}
                          quality={85}
                          onLoadingComplete={() => handleImageLoad(img.src)}
                          onLoadStart={() => handleImageLoadStart(img.src)}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative" style={{ minHeight: '600px' }}>
                        {imageLoadingStates[img.src] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <div className="relative w-full max-w-[350px] aspect-[9/16]">
                          <Image
                            src={img.src}
                            alt={img.alt || `${section.title}の画像${idx+1}`}
                            fill
                            className="rounded-lg border shadow-sm object-contain"
                            priority={idx === 0}
                            loading={idx === 0 ? "eager" : "lazy"}
                            quality={85}
                            onLoadingComplete={() => handleImageLoad(img.src)}
                            onLoadStart={() => handleImageLoadStart(img.src)}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            sizes="(max-width: 350px) 100vw, 350px"
                          />
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </div>
      </div>
    </main>
  );
}