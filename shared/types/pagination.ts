// Cursor-based pagination response (for frontend)
export interface CursorPagination {
  nextCursor: string | null
}

// Page-based pagination response (for admin)
export interface PagePagination {
  page: number
  pageSize: number
  total: number
}

// Cursor-based paginated list response
export interface CursorPaginatedList<T> {
  data: T[]
  pagination: CursorPagination
}

// Page-based paginated list response
export interface PagePaginatedList<T> {
  data: T[]
  pagination: PagePagination
}
