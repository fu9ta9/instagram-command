export const MATCH_TYPE = {
  EXACT: 1,
  PARTIAL: 2
} as const;

export type MatchType = typeof MATCH_TYPE[keyof typeof MATCH_TYPE];

export enum REPLY_TYPE {
  POST = 1,
  STORY = 2,
  LIVE = 3
}

export type TabType = 'post' | 'story' | 'live'

export interface Button {
  id: number
  title: string
  url: string
  order: number
}

export interface Reply {
  id: number
  keyword: string
  reply: string
  userId: string
  postId: string | null
  replyType: number
  matchType: number
  commentReplyEnabled: boolean
  buttons?: {
    id: number
    title: string
    url: string
    order: number
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface ReplyInput {
  keyword: string
  reply: string
  replyType: number
  matchType: number
  commentReplyEnabled: boolean
  postId?: string
  buttons: {
    title: string
    url: string
  }[]
}

export interface ReplyFormData {
  id?: number
  keyword: string
  reply: string
  matchType: MatchType
  commentReplyEnabled: boolean
  buttons?: {
    title: string
    url: string
  }[]
  postId?: string
}

export interface ReplyState {
  replies: Reply[]
  storyReplies: Reply[]
  liveReplies: Reply[]
  isModalOpen: boolean
  editingReply: Reply | null
  isLoading: boolean
  activeTab: TabType
}

export interface ReplyActions {
  setReplies: (replies: Reply[]) => void
  setStoryReplies: (replies: Reply[]) => void
  setLiveReplies: (replies: Reply[]) => void
  setIsModalOpen: (isOpen: boolean) => void
  setEditingReply: (reply: Reply | null) => void
  setIsLoading: (loading: boolean) => void
  setActiveTab: (tab: TabType) => void
  clearAll: () => void
}