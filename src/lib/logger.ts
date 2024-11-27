import { prisma } from '@/lib/prisma';

export async function logExecution(message: string, data?: any) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: data 
          ? `${message}: ${JSON.stringify(data, null, 2)}`
          : message
      }
    });
  } catch (error) {
    console.error('ログ記録エラー:', error);
  }
} 