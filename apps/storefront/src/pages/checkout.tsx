import CheckoutProgress from "@/components/checkout-progress"
import { CartEmpty } from "@/components/cart"
import { Loading } from "@/components/ui/loading"
import { useCart } from "@/lib/hooks/use-cart"
import { useCustomer } from "@/lib/hooks/use-customer"
import { STEP_COUNTER, STEP_HEADING } from "@/lib/constants/checkout-ui"
import { type CheckoutStep, CheckoutStepKey } from "@/lib/types/global"
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router"
import { lazy, Suspense, useCallback, useEffect, useMemo } from "react"

const DeliveryStep = lazy(() => import("@/components/checkout-delivery-step"))
const AddressStep = lazy(() => import("@/components/checkout-address-step"))
const PaymentStep = lazy(() => import("@/components/checkout-payment-step"))
const ReviewStep = lazy(() => import("@/components/checkout-review-step"))
const CheckoutSummary = lazy(() => import("@/components/checkout-summary"))

const Checkout = () => {
  const { step } = useLoaderData({
    from: "/$countryCode/checkout",
  })
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: customer, isLoading: customerLoading } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()
  const { countryCode } = useParams({ strict: false })

  // The auth token lives in localStorage, so this can't be a loader redirect —
  // the server has no way to know who's signed in.
  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate({
        to: "/$countryCode/auth",
        params: { countryCode: countryCode || "in" },
        search: { redirect: location.pathname },
        replace: true,
      })
    }
  }, [customer, customerLoading, countryCode, location.pathname, navigate])

  const steps: CheckoutStep[] = useMemo(() => {
    return [
      {
        key: CheckoutStepKey.ADDRESSES,
        title: "Addresses",
        description: "Enter your shipping and billing addresses.",
        completed: !!(cart?.shipping_address && cart?.billing_address),
      },
      {
        key: CheckoutStepKey.DELIVERY,
        title: "Delivery",
        description: "Select a shipping method.",
        completed: !!cart?.shipping_methods?.length,
      },
      {
        key: CheckoutStepKey.PAYMENT,
        title: "Payment",
        description:
          "Select a payment method. You won't be charged until you place your order.",
        completed: !!cart?.payment_collection?.payment_sessions?.length,
      },
      {
        key: CheckoutStepKey.REVIEW,
        title: "Review",
        description: "Review your order details before placing your order.",
        completed: false,
      },
    ]
  }, [cart])

  const currentStepIndex = useMemo(
    () => steps.findIndex((s) => s.key === step),
    [step, steps]
  )

  const goToStep = useCallback(
    (stepKey: CheckoutStepKey) => {
      navigate({
        to: `${location.pathname}?step=${stepKey}`,
        replace: true,
      })
    },
    [navigate, location.pathname]
  )

  useEffect(() => {
    // Determine which step to show based on cart state
    if (!cart) {
      return
    }

    if (
      step !== CheckoutStepKey.ADDRESSES &&
      currentStepIndex >= 0 &&
      !steps[0].completed
    ) {
      goToStep(CheckoutStepKey.ADDRESSES)
      return
    }

    if (
      step !== CheckoutStepKey.DELIVERY &&
      currentStepIndex >= 1 &&
      !steps[1].completed
    ) {
      goToStep(CheckoutStepKey.DELIVERY)
      return
    }

    if (
      step !== CheckoutStepKey.PAYMENT &&
      currentStepIndex >= 2 &&
      !steps[2].completed
    ) {
      goToStep(CheckoutStepKey.PAYMENT)
      return
    }
  }, [cart, steps, step, currentStepIndex, goToStep])

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex].key)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex].key)
    }
  }

  // Don't flash the checkout to a signed-out visitor mid-redirect.
  if (customerLoading || !customer) {
    return (
      <div className="content-container pt-40 pb-8">
        <Loading />
      </div>
    )
  }

  return (
    <div className="content-container pt-40 pb-20 flex flex-col gap-12">
      {/* Progress Steps */}
      <div className="flex flex-col gap-6 border-b border-neutral-200 pb-6">
        <CheckoutProgress
          steps={steps}
          currentStepIndex={currentStepIndex}
          handleStepChange={goToStep}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
        {/* Left Column - Checkout Steps */}
        <div className="lg:col-span-2">
          {/* Step heading */}
          <div className="flex flex-col gap-3 mb-10">
            <span className={STEP_COUNTER}>
              Step {String(currentStepIndex + 1).padStart(2, "0")} /{" "}
              {String(steps.length).padStart(2, "0")}
            </span>
            <h1 className={STEP_HEADING}>{steps[currentStepIndex].title}</h1>
            <p className="text-sm text-neutral-500 max-w-md">
              {steps[currentStepIndex].description}
            </p>
          </div>

          <Suspense fallback={<Loading />}>
            {cartLoading && <Loading />}
            {cart && (
              <>
                {/* Address Step */}
                {step === CheckoutStepKey.ADDRESSES && (
                  <AddressStep cart={cart} onNext={handleNext} />
                )}

                {/* Delivery Step */}
                {step === CheckoutStepKey.DELIVERY && (
                  <DeliveryStep
                    cart={cart}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}

                {/* Payment Step */}
                {step === CheckoutStepKey.PAYMENT && (
                  <PaymentStep
                    cart={cart}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}

                {/* Review Step */}
                {step === CheckoutStepKey.REVIEW && (
                  <ReviewStep
                    cart={cart}
                    onBack={handleBack}
                    onEdit={goToStep}
                  />
                )}
              </>
            )}
          </Suspense>
        </div>

        {/* Right Column - Order Summary */}
        <Suspense fallback={<Loading />}>
          {cartLoading && <Loading />}
          {cart && <CheckoutSummary cart={cart} />}
          {!cart && !cartLoading && <CartEmpty />}
        </Suspense>
      </div>
    </div>
  )
}

export default Checkout
