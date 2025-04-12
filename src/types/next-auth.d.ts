import { DefaultSession } from 'next-auth';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      instagram?: {
        connected: boolean;
        name?: string;
        id?: string;
        profile_picture_url?: string;
      };
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}
