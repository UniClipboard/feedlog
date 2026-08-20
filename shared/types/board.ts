// Board list item
export interface BoardItem {
  id: string
  name: string
  description: string | null
  position: number
  postCount: number
  createdAt: string
}
