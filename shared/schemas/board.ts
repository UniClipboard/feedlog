import { z } from 'zod/v4'

export const createBoardSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().optional(),
})

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().trim().nullable().optional(),
})

export const reorderBoardSchema = z.object({
  ids: z.array(z.uuid()).min(1, 'IDs are required'),
})
