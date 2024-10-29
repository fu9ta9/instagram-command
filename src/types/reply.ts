export interface Reply {
  id: string;
  keyword: string;
  reply: string;
  postImage: string;
  buttons?: Array<{title: string, url: string}>;
  instagramPostId: string;
  matchType: 'partial' | 'exact';
}

export type ReplyInput = Omit<Reply, 'id'>;

export interface ReplyFormData extends ReplyInput {
  instagramPostId: string;
}