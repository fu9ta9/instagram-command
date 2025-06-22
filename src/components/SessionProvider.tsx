'use client'

import { SessionProvider as Provider } from 'next-auth/react'

const isTest = process.env.NEXT_PUBLIC_APP_ENV === 'test';

const testSession = {
  user: {
    id: 'cmblee9990001y54p16rihftt',
    name: 'テストGoogleユーザー',
    email: 'test-google@example.com',
  },
  expires: '2099-12-31T23:59:59.999Z'
};

type Props = {
  children: React.ReactNode
  session?: any  // NextAuthが安全に管理するセッション情報
}

export default function SessionProvider({ children, session }: Props) {
  return <Provider session={isTest ? testSession : session}>{children}</Provider>
}