import { CartPromo } from "@/components/cart"
import { Thumbnail } from "@/components/ui/thumbnail"
import { Loading } from "@/components/ui/loading"
import { Price } from "@/components/ui/price"
import { EYEBROW_MUTED } from "@/lib/constants/checkout-ui"
import { HttpTypes } from "@medusajs/types"
import { ShieldCheck } from "@medusajs/icons"
import { Suspense } from "react"

interface CheckoutSummaryProps {
  cart: HttpTypes.StoreCart;
}

const SummaryRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
      {label}
    </span>
    <span className="text-sm text-neutral-900">{children}</span>
  </div>
)

/**
 * The order summary panel shown alongside every checkout step.
 */
const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <div className="h-fit sticky lg:top-28">
      <div className="border border-neutral-200 bg-white p-6 lg:p-8">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-neutral-900 font-semibold">
          Order Summary
        </h2>

        <div className="mt-4 h-px bg-neutral-200" />

        {/* Line items */}
        <Suspense fallback={<Loading />}>
          <div className="flex flex-col gap-6 py-6">
            {cart.items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    alt={item.product_title || item.title}
                    className="w-16"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <p className="text-xs uppercase tracking-[0.1em] font-semibold text-neutral-900">
                    {item.product_title}
                  </p>
                  {item.variant_title &&
                    item.variant_title !== "Default Variant" && (
                      <p className="text-xs text-neutral-500">
                        {item.variant_title}
                      </p>
                    )}
                  <p className="text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </p>
                  <Price
                    price={item.total || 0}
                    currencyCode={cart.currency_code}
                    textSize="small"
                    textWeight="plus"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </Suspense>

        <div className="h-px bg-neutral-200" />

        {/* Totals */}
        <div className="flex flex-col gap-3 py-6">
          <SummaryRow label="Subtotal">
            <Price
              price={cart.subtotal}
              currencyCode={cart.currency_code}
              textSize="small"
            />
          </SummaryRow>
          <SummaryRow label="Shipping">
            {!hasShippingMethod ? (
              // Before a delivery method is picked the zero here is misleading.
              <span className="text-sm text-neutral-500">
                Calculated next step
              </span>
            ) : cart.shipping_total === 0 ? (
              <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-900">
                Complimentary
              </span>
            ) : (
              <Price
                price={cart.shipping_total}
                currencyCode={cart.currency_code}
                textSize="small"
              />
            )}
          </SummaryRow>
          {cart.discount_total > 0 && (
            <SummaryRow label="Discount">
              <Price
                price={cart.discount_total}
                currencyCode={cart.currency_code}
                type="discount"
                textSize="small"
              />
            </SummaryRow>
          )}
          <SummaryRow label="Taxes">
            <Price
              price={cart.tax_total}
              currencyCode={cart.currency_code}
              textSize="small"
            />
          </SummaryRow>
        </div>

        <div className="h-px bg-neutral-200" />

        {/* Total */}
        <div className="flex items-baseline justify-between py-6">
          <span className="font-display text-lg uppercase tracking-wide text-neutral-900">
            Total
          </span>
          <Price
            price={cart.total}
            currencyCode={cart.currency_code}
            textSize="xlarge"
            textWeight="plus"
          />
        </div>

        <Suspense fallback={<Loading />}>
          <CartPromo cart={cart} />
        </Suspense>

        <div className="mt-6 flex items-center justify-center gap-2 border border-neutral-200 bg-white py-3">
          <ShieldCheck className="h-4 w-4 text-neutral-500" />
          <span className={EYEBROW_MUTED}>Guaranteed Secure Checkout</span>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
