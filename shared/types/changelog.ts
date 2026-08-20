export const CHANGELOG_CATEGORIES = ['new', 'improved', 'fixed'] as const
export type ChangelogCategory = typeof CHANGELOG_CATEGORIES[number]

export const CHANGELOG_STATUSES = ['draft', 'published', 'needs_update'] as const
export type ChangelogStatus = typeof CHANGELOG_STATUSES[number]

export const CHANGELOG_EMOJIS = ['👍', '❤️', '🎉', '✨', '👀', '🤔'] as const
export type ChangelogEmoji = typeof CHANGELOG_EMOJIS[number]

export const AI_STYLES = ['concise', 'structured', 'benefit-led', 'witty'] as const
export type AiStyle = typeof AI_STYLES[number]

export interface ChangelogAuthor {
  id: string
  name: string | null
  image: string | null
}

// Public list/detail item (reads published_* fields)
export interface ChangelogListItem {
  id: string
  slug: string
  title: string
  content: string
  categories: string[]
  cover: string | null
  publishedAt: string
  reactionCounts: Record<string, number>
  userReactions: string[]
}

// Admin list item (reads editing fields)
export interface ChangelogAdminListItem {
  id: string
  slug: string
  title: string
  status: string
  categories: string[]
  cover: string | null
  publishedAt: string | null
  updatedAt: string
  author: ChangelogAuthor
}

// Admin edit detail
export interface ChangelogAdminDetail {
  id: string
  slug: string
  status: string
  title: string
  content: string
  categories: string[]
  cover: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// AI generation result
export interface ChangelogAiResult {
  title: string
  categories: string[]
  content: string
}
