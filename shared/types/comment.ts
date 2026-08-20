export interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
  isAdmin?: boolean
}

export interface CommentItem {
  id: string
  parentId: string | null
  replyToId: string | null
  replyCount?: number
  likeCount: number
  hasLiked: boolean
  author: CommentAuthor
  content: string
  type: 'comment' | 'mergedPost'
  editedAt: string | null
  createdAt: string
  children?: CommentItem[]
  mergedPost?: {
    post: {
      id: string
      slug: string
      title: string
      excerpt: string | null
      commentCount?: number
      author: CommentAuthor
    }
    comments: {
      data: CommentItem[]
      pagination: { nextCursor: string | null }
    }
  }
}
