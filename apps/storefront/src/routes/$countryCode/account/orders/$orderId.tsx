import { createFileRoute, redirect } from "@tanstack/react-router"
import { sdk } from "@/lib/utils/sdk"
import { sanitize } from "@/lib/utils/sanitize"
import OrderDetail from "@/pages/account/order-detail"

export const Route = createFileRoute("/$countryCode/account/orders/$orderId")({
  component: OrderDetail,
  beforeLoad: async ({ params }) => {
    try {
      const { customer } = await sdk.store.customer.retrieve()
      if (!customer) {
        throw redirect({
          to: "/$countryCode/account",
          params: { countryCode: params.countryCode },
        })
      }
    } catch {
      throw redirect({
        to: "/$countryCode/account",
        params: { countryCode: params.countryCode },
      })
    }
  },
  loader: async ({ params }) => {
    const { order } = await sdk.store.order.retrieve(params.orderId, {
      fields:
        "*items,*items.variant,*items.product,*shipping_address,*billing_address,*fulfillments",
    })
    return sanitize({ order })
  },
})
