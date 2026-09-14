import { createPubSub } from 'graphql-yoga'
import type { Product } from './types'

/**
 * Product Update Events
 */
export type ProductUpdateType = Partial<Pick<Product, 'price' | 'stockCount'>> &
  Pick<Product, 'id'>

/**
 * The events that can be published or subscribed to
 */
export type PubsubEventsType = {
  productUpdates: [ProductUpdateType]
}

/**
 * The PubSub instance
 */
export const pubsub = createPubSub<PubsubEventsType>({})
