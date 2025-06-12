import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // より保守的な接続プール設定
    transactionOptions: {
      maxWait: 20000, // 20秒
      timeout: 20000, // 20秒
    },
    errorFormat: 'minimal',
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}
