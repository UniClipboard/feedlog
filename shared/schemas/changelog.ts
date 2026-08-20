import { z } from 'zod/v4'

export const createChangelogSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(70, 'Title must be 70 characters or less'),
  content: z.string().trim().min(1, 'Content is required'),
  categories: z.array(z.enum(['new', 'improved', 'fixed'])).default([]),
  cover: z.string().nullable().optional(),
})

export const updateChangelogSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(70, 'Title must be 70 characters or less').optional(),
  content: z.string().trim().min(1, 'Content is required').optional(),
  categories: z.array(z.enum(['new', 'improved', 'fixed'])).optional(),
  cover: z.string().nullable().optional(),
})

export const reactionSchema = z.object({
  emoji: z.enum(['👍', '❤️', '🎉', '✨', '👀', '🤔']),
})

export const aiGenerateSchema = z.object({
  feedbackIds: z.array(z.string()).max(10).default([]),
  changeContent: z.string().max(2000).default(''),
  style: z.enum(['concise', 'structured', 'benefit-led', 'witty']),
}).refine(
  data => data.feedbackIds.length > 0 || data.changeContent.trim().length > 0,
  { message: 'Either feedbackIds or changeContent must be provided' },
)
