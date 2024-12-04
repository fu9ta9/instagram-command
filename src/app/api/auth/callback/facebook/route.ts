import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback受信:
        URL: ${request.url}
        Headers: ${JSON.stringify(Object.fromEntries(request.headers))}
        `
      }
    });

    return true;
  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `Facebook Callback エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });
    return NextResponse.json({ error: 'Callback error' }, { status: 500 });
  }
} 