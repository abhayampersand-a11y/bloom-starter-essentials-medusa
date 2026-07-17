import { HttpTypes } from "@medusajs/types"

/**
 * Where an order has got to, as one word a customer would recognise. Medusa
 * splits this across `status`, `payment_status` and the fulfilments; nothing
 * exposes the single label the account screens want, so it's derived here.
 */
export type OrderStage =
  | "delivered"
  | "shipped"
  | "processing"
  | "cancelled"

type OrderLike = Pick<HttpTypes.StoreOrder, "status"> & {
  fulfillments?: HttpTypes.StoreOrderFulfillment[] | null
}

/**
 * Fulfilment is the part customers track, so it wins over `status` once the
 * parcel is moving. Delivery only counts when every fulfilment has landed —
 * a half-delivered order is still in transit from the customer's side.
 */
export function getOrderStage(order: OrderLike): OrderStage {
  if (order.status === "canceled") {
    return "cancelled"
  }

  const fulfillments = order.fulfillments ?? []

  if (fulfillments.length > 0) {
    if (fulfillments.every((f) => f.delivered_at)) {
      return "delivered"
    }
    if (fulfillments.some((f) => f.shipped_at)) {
      return "shipped"
    }
  }

  return "processing"
}

const STAGE_LABELS: Record<OrderStage, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  cancelled: "Cancelled",
}

export function getOrderStageLabel(order: OrderLike): string {
  return STAGE_LABELS[getOrderStage(order)]
}
