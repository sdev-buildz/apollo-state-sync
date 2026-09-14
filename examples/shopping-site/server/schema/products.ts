import type { ProductUpdateType } from '../util/pubsub'
import type { Product } from '../util/types'
import { builder } from './lib/builder'

/** The currently available products info */
const availableProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    summary: 'Noise-cancelling over-ear headphones.',
    description:
      'Experience premium sound quality with active noise cancellation and 30-hour battery life.',
    price: 199,
    stockCount: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300',
  },
  {
    id: '2',
    name: 'Smart Watch',
    summary: 'Fitness tracker and smartwatch.',
    description:
      'Track your workouts, heart rate, and sleep with this sleek waterproof smartwatch.',
    price: 249,
    stockCount: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300',
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    summary: 'RGB backlit mechanical keyboard.',
    description:
      'High-performance backlit switches for a smooth typing experience.',
    price: 89,
    stockCount: 0,
    imageUrl:
      'https://images.unsplash.com/photo-1636352709172-ca33daf4daec?w=400&h=300',
  },
]

const ProductRef = builder.objectRef<Product>('Product')

ProductRef.implement({
  description: `A Product`,
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    summary: t.exposeString('summary'),
    description: t.exposeString('description'),
    price: t.exposeInt('price'),
    stockCount: t.exposeInt('stockCount'),
    imageUrl: t.exposeString('imageUrl'),
  }),
})

builder.queryField('products', (t) =>
  t.field({
    type: [ProductRef],
    description: `List of avaiable products.`,
    resolve: () => availableProducts,
  })
)

builder.queryField('productById', (t) =>
  t.field({
    type: ProductRef,
    description: `To fetch product by id.`,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (_parent, { id }) =>
      availableProducts.find((product) => product.id === id),
  })
)

type CheckoutInputType = Array<{
  id: Product['id']
  count: number
}>
builder.objectRef<CheckoutInputType>('CheckoutInput')
const CheckoutInput = builder.inputType('CheckoutInput', {
  description: `Checkout input`,
  fields: (t) => ({
    id: t.id({ required: true }),
    count: t.int({ required: true }),
  }),
})

builder.mutationField('checkout', (t) =>
  t.field({
    type: [ProductRef],
    description: `Checkout cart`,
    args: {
      cart: t.arg({ type: [CheckoutInput], required: true }),
    },
    resolve: (_, { cart }) => {
      for (const { id, count } of cart) {
        const product = availableProducts.find((p) => p.id === id)
        if (!(product && product.stockCount >= count)) {
          continue
        }
        product.stockCount -= count
      }
      return availableProducts
    },
  })
)

const ProductUpdateRef = builder.objectRef<ProductUpdateType>('ProductUpdate')
ProductUpdateRef.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    stockCount: t.exposeInt('stockCount', { nullable: true }),
    price: t.exposeInt('price', { nullable: true }),
  }),
})

builder.subscriptionField('productUpdates', (t) =>
  t.field({
    type: ProductUpdateRef,
    description: 'Updates the available stock in real-time.',
    subscribe: (_parent, _args, ctx) => ctx.pubsub.subscribe('productUpdates'),
    resolve: (value) => value,
  })
)
