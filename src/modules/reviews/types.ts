export type ReviewItem = {
  id: string
  name: string
  avatarUrl?: string
  rating: number
  productTitle?: string
  comment: string
  adminReply?: {
    author: string
    avatarUrl?: string
    comment: string
  }
}
