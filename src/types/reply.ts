export interface Reply {
  id: number;
  keyword: string;
  reply: string;
  userId: string;
  postId: string | null;
  replyType: number;
  matchType: number;
  buttons?: {
    id: number;
    title: string;
    url: string;
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyFormData {
  keyword: string;
  reply: string;
  matchType: 'exact' | 'partial';
  buttons?: {
    title: string;
    url: string;
  }[];
  instagramPostId?: string;
}

export type ReplyInput = {
  keyword: string;
  reply: string;
  postId: string | null;
  replyType: number;
  matchType: number;
  buttons?: {
    title: string;
    url: string;
    order: number;
  }[];
};