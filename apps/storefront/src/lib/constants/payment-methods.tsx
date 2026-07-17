import React from "react"
import { Cash, CashSolid, CreditCard } from "@medusajs/icons"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentMethodsData: Record<
  string,
  { title: string; description?: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    description: "Pay securely with your card. You won't be charged until you place the order.",
    icon: <CreditCard />,
  },
  pp_system_default: {
    title: "Manual Payment",
    description:
      "Direct bank transfer or digital wallet. Payment details will be provided once your order is reviewed.",
    icon: <Cash />,
  },
  pp_cod_cod: {
    title: "Cash on Delivery",
    description:
      "Pay with cash upon delivery of your order. Please ensure someone is available to receive the package.",
    icon: <CashSolid />,
  },
  // Add more payment providers here
}
