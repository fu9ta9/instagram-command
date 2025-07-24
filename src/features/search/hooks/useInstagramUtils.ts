"use client"

// 数値を読みやすい形式に変換する関数
export const useInstagramUtils = () => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num.toString()
    }
  }

  // 投稿をクリックしたときの処理
  const handlePostClick = (permalink: string) => {
    window.open(permalink, '_blank')
  }

  return {
    formatNumber,
    handlePostClick
  }
}