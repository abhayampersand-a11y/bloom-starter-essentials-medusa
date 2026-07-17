import Address from "@/components/address"
import PaymentButton from "@/components/payment-button"
import PaymentMethodInfo from "@/components/payment-method-info"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/ui/price"
import { BUTTON_LABEL, EYEBROW_MUTED } from "@/lib/constants/checkout-ui"
import { CheckoutStepKey } from "@/lib/types/global"
import { getActivePaymentSession, isPaidWithGiftCard } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"

interface ReviewStepProps {
  cart: HttpTypes.StoreCart;
  onBack: () => void;
  /** Jumps back to an earlier step to change one of the summarised values. */
  onEdit?: (step: CheckoutStepKey) => void;
}

const ReviewRow = ({
  label,
  onEdit,
  children,
}: {
  label: string
  onEdit?: () => void
  children: React.ReactNode
}) => (
  <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-[180px_1fr_auto] md:items-start md:gap-6">
    <span className={`${EYEBROW_MUTED} md:pt-0.5`}>{label}</span>
    <div className="text-sm text-neutral-900">{children}</div>
    {onEdit ? (
      <button
        type="button"
        onClick={onEdit}
        className="justify-self-start text-[11px] uppercase tracking-[0.12em] text-neutral-900 underline underline-offset-4 hover:text-neutral-500 transition-colors md:justify-self-end"
      >
        Edit
      </button>
    ) : (
      <span />
    )}
  </div>
)

const ReviewStep = ({ cart, onBack, onEdit }: ReviewStepProps) => {
  const paidByGiftcard = isPaidWithGiftCard(cart)
  const activeSession = getActivePaymentSession(cart)

  return (
    <div className="flex flex-col gap-10">
      <div className="divide-y divide-neutral-200 border border-neutral-200 bg-neutral-100/60">
        {cart.shipping_address && (
          <ReviewRow
            label="Shipping Address"
            onEdit={onEdit ? () => onEdit(CheckoutStepKey.ADDRESSES) : undefined}
          >
            <Address address={cart.shipping_address} className="text-neutral-900" />
          </ReviewRow>
        )}

        {cart.shipping_methods?.[0] && (
          <ReviewRow
            label="Delivery Method"
            onEdit={onEdit ? () => onEdit(CheckoutStepKey.DELIVERY) : undefined}
          >
            <div className="flex items-center gap-2">
              <span>{cart.shipping_methods[0].name}</span>
              {cart.shipping_methods[0].amount === 0 ? (
                <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                  Complimentary
                </span>
              ) : (
                <Price
                  price={cart.shipping_methods[0].amount}
                  currencyCode={cart.currency_code}
                  textSize="small"
                />
              )}
            </div>
          </ReviewRow>
        )}

        <ReviewRow
          label="Billing Address"
          onEdit={onEdit ? () => onEdit(CheckoutStepKey.ADDRESSES) : undefined}
        >
          {cart.billing_address ? (
            <Address address={cart.billing_address} className="text-neutral-900" />
          ) : (
            <span>Same as shipping address</span>
          )}
        </ReviewRow>

        <ReviewRow
          label="Payment Method"
          onEdit={onEdit ? () => onEdit(CheckoutStepKey.PAYMENT) : undefined}
        >
          <div className="flex items-center gap-2">
            {activeSession && (
              <PaymentMethodInfo provider_id={activeSession.provider_id} />
            )}
            {paidByGiftcard && <span>Gift Card</span>}
          </div>
        </ReviewRow>
      </div>

      <p className="text-xs text-neutral-500 max-w-md">
        When you place your order, your payment will be authorized and we&apos;ll
        start processing your order.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" size="fit" onClick={onBack} className={BUTTON_LABEL}>
            Back
          </Button>

          <PaymentButton cart={cart} className={`w-fit ${BUTTON_LABEL}`} />
        </div>
        <p className="text-[11px] text-neutral-500">
          By placing your order you agree to our Terms &amp; Conditions and
          Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default ReviewStep
