import { OrderDetails } from "@/components/order"
import { BUTTON_LABEL } from "@/lib/constants/checkout-ui"
import { Link, useLoaderData } from "@tanstack/react-router"

/**
 * Shown once an order is placed: confirms it landed, then lays out everything
 * the customer just bought and where it's going.
 */
const OrderConfirmation = () => {
  const { order, countryCode } = useLoaderData({
    from: "/$countryCode/order/$orderId/confirmed",
  })

  return (
    <div className="content-container pt-40 pb-24">
      <div className="mx-auto max-w-3xl">
        {/* Confirmation */}
        <div className="flex flex-col items-center gap-3 text-center mb-16">
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-neutral-900">
            Thank you for your order
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Order #{order.display_id}
          </p>
        </div>

        <OrderDetails order={order} />

        <Link
          to="/$countryCode/store"
          params={{ countryCode }}
          className={`mt-16 flex w-full items-center justify-center border border-transparent bg-zinc-800 text-white transition-colors hover:bg-zinc-700 ${BUTTON_LABEL}`}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default OrderConfirmation
