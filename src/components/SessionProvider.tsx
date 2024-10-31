'use client'

import { SessionProvider as Provider } from 'next-auth/react'

type Props = {
  children: React.ReactNode
  session: any  // NextAuthが安全に管理するセッション情報
}

export default function SessionProvider({ children, session }: Props) {
  return <Provider session={session}>{children}</Provider>
}