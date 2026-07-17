import SquareRadio from "@/components/ui/square-radio"
import { paymentMethodsData } from "@/lib/constants/payment-methods"
import React from "react"

type PaymentContainerProps = {
  paymentProviderId: string;
  selectedPaymentOptionId: string | null;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
};

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  disabled = false,
  children,
  onClick,
}) => {
  const isSelected = selectedPaymentOptionId === paymentProviderId

  return (
    <div
      className={`flex flex-col gap-y-2 text-sm cursor-pointer p-6 border transition-colors ${
        isSelected
          ? "border-neutral-900 bg-neutral-50"
          : "border-neutral-200 bg-white hover:border-neutral-400"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-x-4">
          <span className="mt-0.5">
            <SquareRadio
              name="payment_method"
              checked={isSelected}
              readOnly
              tabIndex={-1}
            />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-900">
              {paymentMethodsData[paymentProviderId]?.title || paymentProviderId}
            </p>
            {paymentMethodsData[paymentProviderId]?.description && (
              <p className="max-w-lg text-xs leading-relaxed text-neutral-500">
                {paymentMethodsData[paymentProviderId].description}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 justify-self-end text-neutral-400">
          {paymentMethodsData[paymentProviderId]?.icon}
        </span>
      </div>
      {children}
    </div>
  )
}

export default PaymentContainer
