import { PrismaClient } from '@prisma/client'

// グローバル空間に型を定義
declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * PrismaClientのシングルトンインスタンスを作成
 * DB同時接続(Max Connection)の負荷を下げるため、グローバルで1つのインスタンスを使い回す
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // コネクションプール設定を最適化
    transactionOptions: {
      maxWait: 10000, // 10秒に短縮
      timeout: 10000, // 10秒に短縮
    },
    errorFormat: 'minimal',
  })
}

// 開発環境でのシングルトンパターンを確実に実装
const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined
}

// 開発環境では既存のインスタンスを再利用、本番環境では新規作成
export const globalPrisma = globalForPrisma.__prisma ?? prismaClientSingleton()

// 開発環境でのみグローバルに保存（ホットリロード対応）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = globalPrisma
}

// 後方互換性のために既存のexportも維持
export const prisma = globalPrisma
