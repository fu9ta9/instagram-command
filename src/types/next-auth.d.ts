import { DefaultSession } from 'next-auth';
import NextAuth from 'next-auth';

interface InstagramData {
  id: string;
  name: string;
  profile_picture_url?: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      instagram?: {
        id: string;
        name: string;
        profile_picture_url?: string;
      } | null;
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}
