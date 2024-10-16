export const ReplyType = {
  SPECIFIC_POST: 1,
  ALL_POSTS: 2,
  STORY: 3
} as const;

export type ReplyType = typeof ReplyType[keyof typeof ReplyType];

export const MatchType = {
  EXACT: 1,
  PARTIAL: 2
} as const;

export type MatchType = typeof MatchType[keyof typeof MatchType];
