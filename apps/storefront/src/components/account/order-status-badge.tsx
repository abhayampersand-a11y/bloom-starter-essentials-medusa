import { clsx } from "clsx"

import { OrderStage } from "@/lib/utils/order-status"

/** Square, hairline, uppercase — one colour per stage, text and border matched. */
const STAGE_CLASSES: Record<OrderStage, string> = {
  delivered: "border-[#626F4A] text-[#626F4A]",
  shipped: "border-neutral-900 text-neutral-900",
  processing: "border-neutral-400 text-neutral-500",
  cancelled: "border-rose-700 text-rose-700",
}

const STAGE_LABELS: Record<OrderStage, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  cancelled: "Cancelled",
}

type OrderStatusBadgeProps = {
  stage: OrderStage
  className?: string
}

const OrderStatusBadge = ({ stage, className }: OrderStatusBadgeProps) => {
  return (
    <span
      className={clsx(
        "inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.1em]",
        STAGE_CLASSES[stage],
        className
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  )
}

export default OrderStatusBadge
