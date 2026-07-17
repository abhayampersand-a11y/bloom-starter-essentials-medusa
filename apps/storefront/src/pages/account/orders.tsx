import { HttpTypes } from "@medusajs/types"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { useEffect } from "react"

import AccountLayout from "@/components/account/account-layout"
import OrderStatusBadge from "@/components/account/order-status-badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { BUTTON_LABEL, CARD, FIELD_LABEL } from "@/lib/constants/account-ui"
import { useCustomer } from "@/lib/hooks/use-customer"
import { useCustomerOrders } from "@/lib/hooks/use-customer-orders"
import { getOrderStage } from "@/lib/utils/order-status"
import { formatPrice } from "@/lib/utils/price"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

/** The first few item images, overlapped — enough to recognise the order by. */
const ItemThumbnails = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const thumbnails = (order.items ?? [])
    .map((item) => item.thumbnail)
    .filter((src): src is string => !!src)
    .slice(0, 3)

  if (thumbnails.length === 0) {
    return null
  }

  return (
    <div className="flex pt-2">
      {thumbnails.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className="h-10 w-8 border border-neutral-200 bg-white object-cover"
          style={{ marginLeft: index === 0 ? 0 : -8 }}
        />
      ))}
    </div>
  )
}

const Orders = () => {
  const { countryCode = "in" } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: customer, isLoading: customerLoading } = useCustomer()
  const { data: orders, isLoading: ordersLoading } = useCustomerOrders()

  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate({
        to: "/$countryCode/auth",
        params: { countryCode },
        search: { redirect: `/${countryCode}/account/orders` },
        replace: true,
      })
    }
  }, [customer, customerLoading, countryCode, navigate])

  const isLoading = customerLoading || ordersLoading

  return (
    <AccountLayout
      countryCode={countryCode}
      current="orders"
      title="Orders"
      subline="Track and review everything you've ordered."
    >
      {isLoading ? (
        <Loading rows={4} height="h-16" />
      ) : orders && orders.length > 0 ? (
        <div className={CARD}>
          {/* The column headings only make sense once the rows sit in a row. */}
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-neutral-200 px-5 py-3 md:grid">
            <span className={FIELD_LABEL}>Order</span>
            <span className={FIELD_LABEL}>Date</span>
            <span className={FIELD_LABEL}>Status</span>
            <span className={`${FIELD_LABEL} text-right`}>Total</span>
          </div>

          {orders.map((order: HttpTypes.StoreOrder) => (
            <Link
              key={order.id}
              to="/$countryCode/account/orders/$orderId"
              params={{ countryCode, orderId: order.id }}
              className="grid grid-cols-2 items-center gap-x-4 gap-y-2 border-b border-neutral-200 px-5 py-5 transition-colors last:border-b-0 hover:bg-neutral-50 md:grid-cols-[1.4fr_1fr_1fr_auto]"
            >
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-neutral-900">
                  #{order.display_id}
                </span>
                <ItemThumbnails order={order} />
              </div>

              <span className="order-3 text-[13px] text-neutral-600 md:order-none">
                {formatDate(String(order.created_at))}
              </span>

              <div className="order-2 justify-self-end md:order-none md:justify-self-start">
                <OrderStatusBadge stage={getOrderStage(order)} />
              </div>

              <span className="order-4 justify-self-end text-sm font-medium text-neutral-900 md:order-none">
                {formatPrice({
                  amount: order.total,
                  currency_code: order.currency_code,
                })}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center border border-neutral-200 bg-white px-6 py-20 text-center">
          <p className="text-[13px] uppercase tracking-[0.15em] text-neutral-900">
            No orders yet
          </p>
          <p className="max-w-xs pt-3 text-sm text-neutral-600">
            When you place your first order it&apos;ll appear here.
          </p>
          <Link to="/$countryCode/store" params={{ countryCode }} className="mt-8">
            <Button size="fit" className={BUTTON_LABEL}>
              Start Shopping
            </Button>
          </Link>
        </div>
      )}
    </AccountLayout>
  )
}

export default Orders
