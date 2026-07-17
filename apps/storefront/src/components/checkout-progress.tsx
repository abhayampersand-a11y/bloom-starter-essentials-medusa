import { CheckCircleSolid } from "@medusajs/icons"
import { CheckoutStep, CheckoutStepKey } from "@/lib/types/global"
import { clsx } from "clsx"

type CheckoutProgressProps = {
  steps: CheckoutStep[];
  currentStepIndex: number;
  handleStepChange: (step: CheckoutStepKey) => void;
  className?: string;
};

/**
 * The checkout step nav. Steps already passed keep their tick and stay
 * clickable; steps ahead are disabled until their prerequisites are met.
 */
const CheckoutProgress = ({
  steps,
  currentStepIndex,
  handleStepChange,
  className,
}: CheckoutProgressProps) => {
  return (
    <nav
      className={clsx("flex flex-wrap items-center gap-x-4 gap-y-3", className)}
      aria-label="Checkout progress"
    >
      {steps.map((step, index) => {
        const isCurrent = index === currentStepIndex
        const isDone = index < currentStepIndex
        const isUpcoming = index > currentStepIndex

        return (
          <div key={step.key} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleStepChange(step.key)}
              disabled={isUpcoming}
              aria-current={isCurrent ? "step" : undefined}
              className={clsx(
                "flex items-center gap-2 pb-1 border-b transition-colors",
                "text-[11px] uppercase tracking-[0.15em]",
                isCurrent &&
                  "text-neutral-900 font-semibold border-neutral-900",
                isDone &&
                  "text-neutral-900 border-transparent hover:text-neutral-500 cursor-pointer",
                isUpcoming &&
                  "text-neutral-400 border-transparent cursor-not-allowed"
              )}
            >
              {isDone && <CheckCircleSolid className="h-3.5 w-3.5" />}
              {step.title}
            </button>

            {index < steps.length - 1 && (
              <span aria-hidden="true" className="h-px w-8 bg-neutral-300" />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default CheckoutProgress
