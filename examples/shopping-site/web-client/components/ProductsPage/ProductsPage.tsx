import { gql, type TypedDocumentNode } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import type { Mutation, Product } from '@types-gen-react-apollo'
import { useReducer } from 'react'
import { productsQuery } from '../../util/docNodes'

/**
 * The page has a list of available products, a cart and a checkout button.
 */
export const ProductsPage = () => {
  const productsResult = useQuery(productsQuery, {
    fetchPolicy: 'network-only',
  })

  const [cart, cartDispatch] = useReducer<
    Array<{ id: NonNullable<Product['id']>; count: number }>,
    [{ id: NonNullable<Product['id']>; remove?: boolean }]
  >((prev, action) => {
    const inCart = prev.find((p) => p.id === action.id)

    // Remove from cart
    if (action.remove) {
      if (!inCart) return prev
      if (inCart.count === 1) return prev.filter((p) => p.id !== action.id)
      return prev.map((p) =>
        p.id === action.id ? { ...p, count: p.count - 1 } : p
      )
    }

    // Add to cart
    const stockCount = productsResult.data?.products?.find(
      (p) => p.id === action.id
    )?.stockCount

    if (inCart) {
      return prev.map((p) => {
        if (p.id !== action.id) return p
        if (p.count === stockCount) return p
        return { ...p, count: p.count + 1 }
      })
    }

    if (stockCount === 0) return prev
    return [...prev, { id: action.id, count: 1 }]
  }, [])

  const [checkout] = useMutation(
    gql`
      mutation checkoutMutation($cart: [CheckoutInput!]!) {
        checkout(cart: $cart) {
          id
          stockCount
        }
      }
    ` as TypedDocumentNode<Pick<Mutation, 'checkout'>>,
    {
      variables: {
        cart,
      },
    }
  )

  const [notifications, setNotifications] = useState<string[]>([])

  //  Subsribe to product updates on price and stock quantities
  useSubscription(
    gql`
      subscription productUpdates {
        productUpdates {
          id
          price
          stockCount
        }
      }
    ` as TypedDocumentNode<Pick<Subscription, 'productUpdates'>>,
    {
      fetchPolicy: 'network-only',
      onData: ({ data }) => {
        const productUpdates = data.data?.productUpdates
        if (!productUpdates) return
        productUpdates.forEach((product) => {
          for (const attr of ['price', 'stockCount'] satisfies Array<
            keyof Product
          >) {
            const productData = catalogResult.data?.products?.find(
              (p) => p.id === product.id
            )
            if (attr in product && product[attr] !== productData?.[attr]) {
              {
                setNotifications((notifications) => [
                  ...notifications,
                  `${productData?.name}'s new ${attr === 'stockCount' ? 'stock count' : 'price'} is ${product[attr]}`,
                ])
                setTimeout(() => {
                  setNotifications((notifications) => [
                    ...notifications.slice(1),
                  ])
                }, 2000)
              }
            }
          }
        })
      },
    }
  )

  return (
    <section className='products-page'>
      <hgroup>
        <h2>Products Page</h2>
        <p>Add Products to cart and click on checkout button</p>
      </hgroup>

      <ul className='notifications'>
        {notifications.map((notification) => (
          <li
            role='status'
            aria-live='polite'
            aria-atomic='true'
            className='notification'
          >
            {notification}
          </li>
        ))}
      </ul>

      <div className='browse'>
        {/* Catalog */}
        <section className='catalog'>
          {productsResult.data?.products?.map((product) => (
            <article key={product.id} className='product'>
              <img
                src={product.imageUrl ?? undefined}
                width={'250rem'}
                alt={product.name ?? 'product image'}
                style={{
                  width: '20rem',
                  minHeight: '15rem',
                  backgroundColor: '#f0f0f0',
                  display: 'block',
                }}
              ></img>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <data className='price' value={product.price ?? undefined}>
                ${product.price}
              </data>
              <button
                className='addToCart'
                onClick={() => cartDispatch({ id: product.id! })}
                disabled={
                  product.stockCount === 0
                    ? true
                    : cart.find((p) => p.id === product.id)?.count ===
                        product.stockCount
                      ? true
                      : undefined
                }
              >
                +
              </button>
              <button
                className='removeFromCart'
                onClick={() => cartDispatch({ id: product.id!, remove: true })}
                disabled={
                  cart.find((p) => p.id === product.id) ? undefined : true
                }
              >
                -
              </button>
              <br />
              <data
                className='stockCount'
                value={product.stockCount ?? undefined}
              >
                {product.stockCount}
              </data>{' '}
              in stock
            </article>
          ))}
        </section>

        {/* Cart */}
        <section className='cart'>
          {cart.map(({ id, count }) => {
            const product = productsResult.data?.products?.find(
              (p) => p.id === id
            )
            return (
              <article key={id} className='product'>
                <img
                  src={product?.imageUrl ?? ''}
                  width={'200rem'}
                  alt={product?.name ?? 'product image'}
                ></img>
                <h3>{product?.name}</h3>
                <p>{product?.summary}</p>
                <data className='price' value={product?.price ?? undefined}>
                  ${product?.price}
                </data>
                <br />
                <data className='count' value={count}>
                  {count}
                </data>{' '}
                in cart
              </article>
            )
          })}

          {/* Checkout button */}
          <button className='checkout' type='button' onClick={() => checkout()}>
            Checkout
          </button>
        </section>
      </div>
    </section>
  )
}
