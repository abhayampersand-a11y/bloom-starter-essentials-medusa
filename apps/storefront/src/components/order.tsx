import Address from "@/components/address"
import PaymentMethodInfo from "@/components/payment-method-info"
import { Price } from "@/components/ui/price"
import { Thumbnail } from "@/components/ui/thumbnail"
import { EYEBROW_MUTED, SECTION_HEADING } from "@/lib/constants/checkout-ui"
import { isPaidWithGiftCard } from "@/lib/utils/checkout"
import { formatOrderId } from "@/lib/utils/order"
import { HttpTypes } from "@medusajs/types"

/** Section eyebrow with the hairline rule under it, used down the whole page. */
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-4">
    <h2 className={SECTION_HEADING}>{children}</h2>
    <div className="h-px bg-neutral-200" />
  </div>
)

/** A label on the left, its value right-aligned on the same line. */
const InfoRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className={EYEBROW_MUTED}>{label}</span>
    <span className="text-sm text-neutral-900">{children}</span>
  </div>
)

type OrderInfoProps = {
  order: HttpTypes.StoreOrder
}

export const OrderInfo = ({ order }: OrderInfoProps) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>Order Details</SectionHeading>

      <div className="flex flex-col gap-3">
        <InfoRow label="Order ID">
          {formatOrderId(`${order.display_id || order.id}`)}
        </InfoRow>
        <InfoRow label="Order Date">
          {new Date(order.created_at!).toLocaleDateString("en-GB", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </InfoRow>
        <InfoRow label="Order Status">
          <span className="capitalize italic text-neutral-500">
            {order.status}
          </span>
        </InfoRow>
        <InfoRow label="Order Email">{order.customer?.email || order.email}</InfoRow>
      </div>
    </div>
  )
}

type OrderLineItemProps = {
  item: HttpTypes.StoreOrderLineItem
  order: HttpTypes.StoreOrder
}

export const OrderLineItem = ({ item, order }: OrderLineItemProps) => {
  return (
    <div className="flex items-start gap-5 py-5 border-b border-neutral-200 last:border-b-0">
      <Thumbnail
        thumbnail={item.thumbnail}
        alt={item.product_title || item.title}
        className="w-16 h-20 shrink-0"
      />
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <span className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-900">
          {item.product_title}
        </span>
        {item.variant_title && item.variant_title !== "Default Variant" && (
          <span className="text-xs text-neutral-500">{item.variant_title}</span>
        )}
        <span className="text-xs text-neutral-500">
          Quantity: {item.quantity}
        </span>
      </div>
      <Price
        price={item.total}
        currencyCode={order.currency_code}
        textSize="small"
        textWeight="plus"
      />
    </div>
  )
}

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>Summary</SectionHeading>

      <div className="flex flex-col gap-3">
        <InfoRow label="Subtotal">
          <Price
            price={order.subtotal}
            currencyCode={order.currency_code}
            textSize="small"
          />
        </InfoRow>
        <InfoRow label="Shipping">
          {order.shipping_total === 0 ? (
            <span className="text-[11px] uppercase tracking-[0.12em]">
              Complimentary
            </span>
          ) : (
            <Price
              price={order.shipping_total}
              currencyCode={order.currency_code}
              textSize="small"
            />
          )}
        </InfoRow>
        {order.discount_total > 0 && (
          <InfoRow label="Discount">
            <Price
              price={order.discount_total}
              currencyCode={order.currency_code}
              type="discount"
              textSize="small"
            />
          </InfoRow>
        )}
        <InfoRow label="Tax">
          <Price
            price={order.tax_total}
            currencyCode={order.currency_code}
            textSize="small"
          />
        </InfoRow>
      </div>

      <div className="h-px bg-neutral-200" />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg uppercase tracking-wide text-neutral-900">
          Total
        </span>
        <Price
          price={order.total}
          currencyCode={order.currency_code}
          textSize="xlarge"
          textWeight="plus"
        />
      </div>
    </div>
  )
}

type OrderShippingProps = {
  order: HttpTypes.StoreOrder
}

/** Left column: where it's going and how it gets there. */
export const OrderShipping = ({ order }: OrderShippingProps) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>Delivery Information</SectionHeading>

      {order.shipping_address && (
        <div className="flex flex-col gap-2">
          <span className={EYEBROW_MUTED}>Shipping Address</span>
          <Address
            address={order.shipping_address}
            className="!text-sm !text-neutral-600"
          />
        </div>
      )}

      {order.shipping_methods?.[0] && (
        <div className="flex flex-col gap-2">
          <span className={EYEBROW_MUTED}>Shipping Method</span>
          <div className="flex items-baseline justify-between gap-4 text-sm text-neutral-900">
            <span>{order.shipping_methods[0].name}</span>
            {order.shipping_methods[0].amount === 0 ? (
              <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Complimentary
              </span>
            ) : (
              <Price
                price={order.shipping_methods[0].amount}
                currencyCode={order.currency_code}
                textSize="small"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type OrderBillingProps = {
  order: HttpTypes.StoreOrder
}

/** Right column: who's paying and how. */
export const OrderBilling = ({ order }: OrderBillingProps) => {
  const paidByGiftcard = isPaidWithGiftCard(order)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>Billing Information</SectionHeading>

      <div className="flex flex-col gap-2">
        <span className={EYEBROW_MUTED}>Billing Address</span>
        <div className="text-sm text-neutral-600">
          {order.billing_address ? (
            <Address
              address={order.billing_address}
              className="!text-sm !text-neutral-600"
            />
          ) : (
            <span>Same as shipping address</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={EYEBROW_MUTED}>Payment Method</span>
        <div className="flex items-center gap-2 text-sm text-neutral-900">
          {order.payment_collections?.[0]?.payment_sessions?.[0] && (
            <PaymentMethodInfo
              provider_id={
                order.payment_collections[0].payment_sessions[0].provider_id
              }
            />
          )}
          {paidByGiftcard && <span>Gift Card</span>}
        </div>
      </div>
    </div>
  )
}

interface OrderDetailsProps {
  order: HttpTypes.StoreOrder
}

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <div className="flex flex-col gap-14">
      <OrderInfo order={order} />

      <div className="flex flex-col gap-6">
        <SectionHeading>Items</SectionHeading>
        <div>
          {order.items?.map((item) => (
            <OrderLineItem key={item.id} item={item} order={order} />
          ))}
        </div>
      </div>

      {/* Delivery and billing sit side by side, each with its own sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <OrderShipping order={order} />
        <OrderBilling order={order} />
      </div>

      <OrderSummary order={order} />
    </div>
  )
}

export default OrderDetails
