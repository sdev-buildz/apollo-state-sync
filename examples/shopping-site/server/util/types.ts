/**
 * User
 */
export type User = {
  id: string
}

/**
 * Product
 */
export type Product = {
  id: string
  name: string
  summary: string
  description: string
  price: number
  stockCount: number
  imageUrl?: string
}
