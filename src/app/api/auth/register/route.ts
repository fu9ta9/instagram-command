import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        membershipType: 'FREE'
      },
    });

    await prisma.executionLog.create({
      data: {
        errorMessage: `ユーザー登録成功: ${email}`
      }
    });

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );

  } catch (error) {
    await prisma.executionLog.create({
      data: {
        errorMessage: `登録エラー: ${error instanceof Error ? error.message : String(error)}`
      }
    });

    return NextResponse.json(
      { message: '登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 