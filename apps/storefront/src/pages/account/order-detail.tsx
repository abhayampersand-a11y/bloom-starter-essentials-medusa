import { ArrowLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Link, useLoaderData, useParams } from "@tanstack/react-router"

import AccountLayout from "@/components/account/account-layout"
import OrderStatusBadge from "@/components/account/order-status-badge"
import { Button } from "@/components/ui/button"
import {
  BUTTON_LABEL,
  CARD,
  FIELD_LABEL,
  SECTION_EYEBROW,
} from "@/lib/constants/account-ui"
import { getOrderStage } from "@/lib/utils/order-status"
import { formatPrice } from "@/lib/utils/price"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const AddressBlock = ({
  heading,
  address,
}: {
  heading: string
  address?: HttpTypes.StoreOrderAddress | null
}) => (
  <div className={`${CARD} p-6`}>
    <h2 className={SECTION_EYEBROW}>{heading}</h2>
    {address ? (
      <div className="flex flex-col gap-1 pt-4 text-[13px] text-neutral-600">
        <span className="text-sm font-medium text-neutral-900">
          {address.first_name} {address.last_name}
        </span>
        <span>{address.address_1}</span>
        {address.address_2 && <span>{address.address_2}</span>}
        <span>
          {[address.city, address.province, address.postal_code]
            .filter(Boolean)
            .join(", ")}
        </span>
        <span className="uppercase">{address.country_code}</span>
        {address.phone && <span className="pt-2">{address.phone}</span>}
      </div>
    ) : (
      <p className="pt-4 text-sm text-neutral-500">Not provided</p>
    )}
  </div>
)

const OrderDetail = () => {
  const { order } = useLoaderData({
    from: "/$countryCode/account/orders/$orderId",
  })
  const { countryCode = "in" } = useParams({ strict: false })

  const currency_code = order.currency_code

  return (
    <AccountLayout
      countryCode={countryCode}
      current="orders"
      eyebrow={`Order #${order.display_id}`}
      title="Order Details"
      subline={`Placed on ${formatDate(order.created_at)}`}
    >
      <div className="flex flex-col gap-10">
        <Link
          to="/$countryCode/account/orders"
          params={{ countryCode }}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Status strip */}
        <div
          className={`${CARD} grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0`}
        >
          <div className="flex flex-col gap-2 p-6">
            <span className={FIELD_LABEL}>Order Total</span>
            <span className="text-base text-neutral-900">
              {formatPrice({ amount: order.total, currency_code })}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-6">
            <span className={FIELD_LABEL}>Payment</span>
            <span className="text-base capitalize text-neutral-900">
              {order.payment_status?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 p-6">
            <span className={FIELD_LABEL}>Fulfilment</span>
            <OrderStatusBadge stage={getOrderStage(order)} />
          </div>
        </div>

        {/* Items */}
        <section className="flex flex-col gap-4">
          <h2 className={SECTION_EYEBROW}>Items ({order.items?.length ?? 0})</h2>

          <div className={CARD}>
            {order.items?.map((item: HttpTypes.StoreOrderLineItem) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b border-neutral-200 p-5 last:border-b-0"
              >
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="h-20 w-16 shrink-0 border border-neutral-200 object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-[13px] font-medium uppercase tracking-[0.1em] text-neutral-900">
                    {item.product_title || item.title}
                  </span>
                  {item.variant_title && (
                    <span className="text-xs text-neutral-500">
                      {item.variant_title}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {formatPrice({ amount: item.subtotal, currency_code })}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Addresses */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AddressBlock heading="Shipping Address" address={order.shipping_address} />
          <AddressBlock heading="Billing Address" address={order.billing_address} />
        </div>

        {/* Summary */}
        <div className={`${CARD} ml-auto w-full max-w-md p-6`}>
          <h2 className={SECTION_EYEBROW}>Summary</h2>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center justify-between">
              <span className={FIELD_LABEL}>Subtotal</span>
              <span className="text-sm text-neutral-900">
                {formatPrice({ amount: order.subtotal, currency_code })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={FIELD_LABEL}>Shipping</span>
              <span className="text-sm text-neutral-900">
                {order.shipping_total
                  ? formatPrice({ amount: order.shipping_total, currency_code })
                  : "Free"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={FIELD_LABEL}>Taxes</span>
              <span className="text-sm text-neutral-900">
                {formatPrice({ amount: order.tax_total || 0, currency_code })}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-4">
              <span className="font-display text-base uppercase tracking-[0.1em] text-neutral-900">
                Total
              </span>
              <span className="text-xl font-semibold text-neutral-900">
                {formatPrice({ amount: order.total, currency_code })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/$countryCode/store" params={{ countryCode }}>
            <Button size="fit" className={BUTTON_LABEL}>
              Buy It Again
            </Button>
          </Link>
          <Link to="/$countryCode/contact" params={{ countryCode }}>
            <Button size="fit" variant="secondary" className={BUTTON_LABEL}>
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </AccountLayout>
  )
}

export default OrderDetail
