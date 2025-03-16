export const MATCH_TYPE = {
  EXACT: 1,
  PARTIAL: 2
} as const;

export type MatchType = typeof MATCH_TYPE[keyof typeof MATCH_TYPE];

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
  matchType: MatchType;
  buttons?: {
    title: string;
    url: string;
  }[];
  postId?: string;
}

export interface ReplyInput {
  keyword: string;
  reply: string;
  replyType: number;
  matchType: number;
  postId?: string;
  buttons: Button[];
}