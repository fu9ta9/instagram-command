export interface Reply {
  id: number;
  instagramPostId: string;
  keyword: string;
  reply: string;
  postImage: string;
  matchType: 'partial' | 'exact';
  buttons: Array<{title: string, url: string}>;
}

export type ReplyInput = Omit<Reply, 'id' | 'instagramPostId'>;

export interface ReplyFormData extends ReplyInput {
  instagramPostId: string;
}