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
  commentReplyEnabled: boolean;
  messageType: 'text' | 'template';
  buttons?: {
    id: number;
    title: string;
    url: string;
    order: number;
  }[];
  posts?: Post[];
  stats?: {
    sentCount: number;
    readCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyFormData {
  keyword: string;
  reply: string;
  matchType: MatchType;
  commentReplyEnabled: boolean;
  messageType: 'text' | 'template';
  buttons?: {
    title: string;
    url: string;
  }[];
  posts?: {
    title: string;
    postId: string;
  }[];
  postId?: string;
}

export interface Button {
  id?: number;
  title: string;
  url: string;
  order?: number;
  replyId?: number;
}

export interface Post {
  id?: number;
  title: string;
  postId: string;
  order: number;
  replyId?: number;
}

export interface ReplyInput {
  keyword: string;
  reply: string;
  replyType: number;
  matchType: number;
  commentReplyEnabled: boolean;
  postId?: string;
  buttons: Button[];
}