import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request): Promise<Boolean> {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback受信:
        URL: ${request.url}
        Headers: ${JSON.stringify(Object.fromEntries(request.headers))}
        `
      }
    });

    // NextAuthのハンドラーにリダイレクト
    return true;
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return false;
  }
} 